#!/usr/bin/python3
from io import StringIO
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
import time
import json
import requests
import datetime
import pandas as pd
import rds_config
import logging
import traceback
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

db_uname = rds_config.db_uname
db_pwd = rds_config.db_pwd
db_host = rds_config.db_host
db_name = rds_config.db_name
data_url = 'https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv'
CODE = '醫事機構代碼'
NAME = '醫事機構名稱'
ADDR = '醫事機構地址'
LN = '經度'
LA = '緯度'
TELE = '醫事機構電話'
BRAND = '廠牌項目'
STOCK = '快篩試劑截至目前結餘存貨數量'
TIME = '來源資料時間'
MEMO = '備註'

table_indices = {
    'code_addr' : [CODE],
    'code_col' : [CODE],
    'code_la' : [CODE],
    'code_ln' : [CODE],
    'code_name' : [CODE],
    'code_tele' : [CODE],
    'new_states' : [TIME, CODE],
    'store_latest' : [CODE]
}

fks = {
    'code_addr' : [('code_name', CODE)],
    'code_col' : [('code_name', CODE)],
    'code_la' : [('code_name', CODE)],
    'code_ln' : [('code_name', CODE)],
    'code_name' : [('code_name', CODE)],
    'code_tele' : [('code_name', CODE)],
    'new_states' : [('code_name', CODE)],
    'store_latest' : [('code_name', CODE)]
}

pks = {
    'code_addr' : [CODE],
    'code_col' : [CODE],
    'code_la' : [CODE],
    'code_ln' : [CODE],
    'code_name' : [CODE],
    'code_tele' : [CODE],
    'new_states' : [TIME, CODE],
    'store_latest' : [CODE]
}

table_cols = {
    'code_addr': [CODE, ADDR],
    'code_col' : [CODE],
    'code_la' : [CODE, LA],
    'code_ln' : [CODE, LN],
    'code_name' : [CODE, NAME],
    'code_tele': [CODE, TELE],
    'new_states' : [CODE, BRAND, STOCK, TIME, MEMO],
    'states' : [CODE, BRAND, STOCK, TIME, MEMO],
    'store_latest' : [CODE, BRAND, STOCK, TIME, MEMO]
}

def table_exists(engine, table_name):
    q = f"SELECT * FROM information_schema.tables WHERE table_name='{table_name}'"
    res = run_queries(engine, [q])
    return True if res else False

def fetch_data():
    r = requests.get(data_url)
    data_io = StringIO(r.text)
    res = dict()
    for table_name, cols in table_cols.items():
        data_io.seek(0)
        df = pd.read_csv(data_io, sep=',', usecols=cols)
        if TIME in cols:
            df[TIME] = pd.to_datetime(df[TIME], format="%Y/%m/%d %H:%M:%S") # %Y/%m/%d %H:%M:%S
        res[table_name] = df
    data_io.close()
    return res

def double2single_quote(s):
    if s.endswith('"') and s.startswith('"'):
        s = "'" + s[1:-1] + "'"
    return s


def create_table(engine, table_name, df):
    df.iloc[:1, :].to_sql(table_name, engine, if_exists='append', index=False)
    task_q = list()
    if table_name in pks.keys():
        task_q.append(f"ALTER TABLE {table_name} ADD PRIMARY KEY({', '.join(pks[table_name])})")
    if table_name in fks.keys():
        for ref_table, col in fks[table_name]:
            task_q.append(f"ALTER TABLE {table_name} ADD CONSTRAINT {table_name}_ref FOREIGN KEY ({col}) REFERENCES {ref_table} ({col})")
    if table_name in table_indices.keys():
        task_q.append(f"CREATE INDEX {table_name}_index ON {table_name}({', '.join(table_indices[table_name])})")
    run_queries(engine, task_q, f"setup table {table_name}")

def gen_insert_non_exists_q(engine, table_name, df, conflict_cond=[CODE]):
    if not table_exists(engine, table_name):
        create_table(engine, table_name, df)
    vals_s = ['(' + ', '.join([double2single_quote(json.dumps(row[field], ensure_ascii=False, default=str)) for field in table_cols[table_name]]) + ')' for index, row in df.iterrows()]
    conflict_attrs_s = ", ".join(conflict_cond)
    q = f"""
    INSERT INTO {table_name} ({', '.join(table_cols[table_name])}) VALUES {', '.join(vals_s)} ON CONFLICT ({conflict_attrs_s}) DO NOTHING;
    """
    return q

def update(engine, table_names=["states", "new_states"], latest_table="store_latest"):
    start_time = time.time()
    logger.info(f"update starts.")
    tables = fetch_data()
    task_q = list()
    for table_name in ['code_name', 'code_addr', 'code_la', 'code_ln', 'code_tele']:
        q = gen_insert_non_exists_q(engine, table_name, tables[table_name])
        task_q.append(q)
    run_queries(engine, task_q, "insert non exists")

    df = tables['new_states']
    df.to_sql('temp_table', engine, if_exists='replace', index=False)
    if not table_exists(engine, latest_table):
        create_table(engine, latest_table, df)
    update_latest_q = f"""
       INSERT INTO {latest_table}
       (select * from temp_table)
       ON CONFLICT ({CODE}) DO UPDATE 
           SET {STOCK} = excluded.{STOCK}, 
               {TIME} = excluded.{TIME},
               {BRAND} = excluded.{BRAND},
               {MEMO} = excluded.{MEMO};"""
    run_queries(engine, [update_latest_q], f"update latest table({latest_table})")

    df.to_sql("states", engine, if_exists='append', index=False)
    q = gen_insert_non_exists_q(engine, "new_states", df, conflict_cond=[CODE, TIME])
    run_queries(engine, [q], f"insert states into new_states")


    logger.info(f"update complete @{datetime.datetime.now()}, cost {time.time()-start_time} seconds.")


def run_queries(engine, q_list: list, task_str="query"):
    start_time = time.time()
    logger.info(f"{task_str} starts")
    conn = engine.raw_connection()
    res = list()
    with conn.cursor() as cur:
        for q in q_list:
            for line in q[:80].split('\n'):
                logger.info(line)
            cur.execute(q)
            try:
                res.extend(cur.fetchall())
            except:
                pass
    conn.commit()
    conn.close()
    logger.info(f"{task_str} completes, cost {time.time() - start_time} seconds")
    return res

def remove_obsolete(engine, tables=["new_states"], interval='7 days'):
    task_q = list()
    for table_name in tables:
        q = f"DELETE FROM {table_name} WHERE {TIME} < (NOW() - interval '{interval}');"
        task_q.append(q)
        # reserve only one record per minute
        q = f"DELETE FROM {table_name} WHERE {TIME} < (NOW() - interval '1 day') AND EXTRACT(SECOND FROM {TIME}) >= 30;"
        task_q.append(q)
    run_queries(engine, task_q, "remove")


def run_interval(func, args=tuple(), second=30):
    while True:
        func_start = time.time()
        func(*args)
        time.sleep(max(0, second - (time.time() - func_start)))

engine_url = f"postgresql+psycopg2://{db_uname}:{db_pwd}@{db_host}:5432/{db_name}"
def get_new_engine():
    if not database_exists(engine_url):
        create_database(engine_url)
    engine = create_engine(engine_url)
    return engine

def main():
    try:
        engine = get_new_engine()
    except Exception as e:
        logger.error(f"ERROR: create connection fails")
        logger.error(e)
        raise e
    try_time = 0
    while try_time < 3:
        try:
            try_time = 0
            run_interval(update, (engine, ))
        except Exception as e:
            logger.error(f"ERROR: encounter unknown error on updating database @ {datetime.datetime.now()}")
            for line in str(traceback.format_exc()).split('\n'):
                logger.error(line)
            logger.error(e)
            try_time += 1

if __name__ == '__main__':
    main()
