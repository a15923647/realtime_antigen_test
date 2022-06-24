from flask import Flask, jsonify, request, Response
from urllib.parse import unquote
import re
import json
import time
import pprint
import requests
import rds_config
from sqlalchemy import create_engine
import psycopg2
TEST = False

db_uname = rds_config.db_uname
db_pwd = rds_config.db_pwd
db_host = rds_config.db_host
db_name = rds_config.db_name

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

def all_meet(inps, f):
    for inp in inps:
        if not f(inp):
            print(f"{inp} not matches")
            return False
    return True

def gen_all_latest_query(codes, memo=False):
    set_str = ', '.join([f"'{c}'" for c in codes])
    return f"""
    SELECT {CODE}, {STOCK}, {TIME} {', ' + MEMO if memo else ''}
    FROM store_latest
    WHERE {CODE} IN ({set_str})
    """

def gen_latest_query(code, memo=False):
    return f"""
    SELECT {CODE}, {STOCK}, {TIME} {', ' + MEMO if memo else ''}
    FROM store_latest
    WHERE {CODE} = '{code}'
    """

def gen_nearby_query(la, ln, hdist, limit=10):
    """
    hdist is in kilometer
    """
    return f"""
    SELECT {CODE}, {NAME}, {ADDR}, {LA}, {LN}, ( 6371 * acos( cos( radians({la}) ) * cos( radians( {LA} ) ) * cos( radians( {LN} ) - radians({ln}) ) + sin( radians({la}) ) * sin(radians({LA})) ) ) AS distance 
    FROM code_la 
         natural join code_ln 
         natural join code_addr
         natural join code_name
    WHERE ( 6371 * acos( cos( radians({la}) ) * cos( radians( {LA} ) ) * cos( radians( {LN} ) - radians({ln}) ) + sin( radians({la}) ) * sin(radians({LA})) ) ) <= {hdist}
    ORDER BY distance 
    LIMIT {limit};"""


def gen_interval_query(code, interval):
    other_constraints = []
    if 'HOUR' in interval.upper():
        other_constraints.append(f"(EXTRACT(SECOND FROM {TIME}) < 30)")
    elif 'DAY' in interval.upper():
        other_constraints.append(f"(EXTRACT(SECOND FROM {TIME}) < 30)")
        other_constraints.append(f"(EXTRACT(MINUTE FROM {TIME}) = 0)")
        #other_constraints.append(f"(EXTRACT(HOUR FROM {TIME}) = 0)")
    other_constraints_s = " and ".join(other_constraints)
    if other_constraints_s:
        other_constraints_s = "and " + other_constraints_s
    return f"""
    set timezone='Asia/Taipei';
    SELECT {STOCK}, {TIME}
    FROM new_states
    WHERE {CODE} = '{code}'
      and 
      ({TIME} BETWEEN (NOW() - interval '{interval}') AND NOW())
      {other_constraints_s}
    ORDER BY {TIME}
    """

def run_query(q, conn):
    try:
        with conn.cursor() as cur:
            cur.execute(q)
            res = cur.fetchall()
    except psycopg2.InterfaceError as ie:
        print(ie)
        conn = engine.raw_connection()
        cur.execute(q)
        res = cur.fetchall()
    except Exception as e:
        print(e)
        conn.rollback()
        return []
    return res

def stringify_query_result(src):
    res = list()
    for tup in src:
        res.append(tuple([str(field) for field in tup]))
    return res

engine_url = f"postgresql+psycopg2://{db_uname}:{db_pwd}@{db_host}:5432/{db_name}"
try:
    engine = create_engine(engine_url, pool_pre_ping=True)
    conn = engine.raw_connection()
except Exception as e:
    print(f"ERROR: create connection fails")
    print(e)
    raise e

app = Flask(__name__)
@app.route('/get_interval_history', methods=['GET'])
def get_interval_history():
    store_code = request.args.get('store_code')
    interval = unquote(request.args.get('interval', '1 day'))
    if not re.match('^([2-9] (days|hours|minutes)|1 (day|hour|minute))$', interval):
        ret_response = Response("invalid input", status=403)
        ret_response.headers['Access-Control-Allow-Origin'] = "*"
        return ret_response

    query = gen_interval_query(store_code, interval)
    print(query)
    res = stringify_query_result(run_query(query, conn))
    res.sort(key=lambda tup: tup[1])
    print(res)
    ret_response = Response(json.dumps(res))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response

@app.route('/get_stocks', methods=['GET'])
def get_stocks():
    stores_code = json.loads(request.args.get('stores_code')) # unsafe
    print(stores_code)
    if not isinstance(stores_code, list) or not all_meet(stores_code, lambda x: re.match('^[0-9A-Z]+$', x)):
        ret_response = Response("invalid stores code input format", status=403)
        ret_response.headers['Access-Control-Allow-Origin'] = "*"
        return ret_response
    cur_states = run_query(gen_all_latest_query(stores_code, memo=True), conn)
    #cur_states = [[str(c) for c in s] for s in cur_states]
    cur_states = stringify_query_result(cur_states)
    headers = 'code, stock, time, memo'.split(', ')
    # Convert data list to dict by zipping with headers.
    cur_states_d = {s[0]: dict(zip(headers, s)) for s in cur_states}
    ret_response = Response(json.dumps(cur_states_d))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response

@app.route('/get_real_dists', methods=['GET'])
def get_real_dists():
    s_la = request.args.get('s_la')
    s_ln = request.args.get('s_ln')
    dsts = json.loads(request.args.get('dsts'))
    def chk(inp):
        return len(inp) == 2 and re.match('^[0-9]+(\.[0-9]+)?$', str(inp[0])) and re.match('^[0-9]+(\.[0-9]+)?$', str(inp[1]))
    if not isinstance(dsts, list) or not all_meet(dsts, chk) or not all_meet([s_la, s_ln], lambda x: re.match('^[0-9]+.?[0-9]*$', x)):
        ret_response = Response("invalid destinations input format", status=403)
        ret_response.headers['Access-Control-Allow-Origin'] = "*"
        return ret_response
    res = list()
    for coord in dsts:
        (f_la, f_ln) = coord
        osrm_url = f"http://osrm_backend:5000/route/v1/foot/{s_ln},{s_la};{f_ln},{f_la}?overview=false"
        r = requests.get(osrm_url)
        if 'routes' in r.json().keys():
            summary = r.json()['routes'][0]['legs'][0]
            res.append(summary['distance'])
        else:
            res.append(2147483647)
    ret_response = Response(json.dumps(res))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response

@app.route('/date_summary', methods=['GET'])
def date_summary():
    q = "SELECT * FROM date_ava"
    ret_response = Response(json.dumps(run_query(q, conn), default=str))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response
    
@app.route('/adj_store_data', methods=['GET'])
def adj_store_data():
    cur_la = request.args.get('latitude')
    cur_ln = request.args.get('longitude')
    hdist = int(request.args.get('hdist', '3'))
    limit = min(int(request.args.get('limit', '20')), 5000)
    if not all_meet([cur_la, cur_ln], lambda x: re.match('^[0-9]+.?[0-9]*$', x)):
        ret_response = Response("invalid position format", status=403)
        ret_response.headers['Access-Control-Allow-Origin'] = "*"
        return ret_response
    print(cur_la, cur_ln, hdist, limit)
    nearby_q = gen_nearby_query(cur_la, cur_ln, hdist, limit)
    print(nearby_q)
    headers = 'code, name, addr, la, ln, hdist'.split(', ')
    stores_info = [dict(zip(headers, store)) for store in run_query(nearby_q, conn)]
    ret_response = Response(json.dumps(stores_info))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response

@app.route('/', methods=['GET'])
def main():
    ret_response = Response(json.dumps("hello world!"))
    ret_response.headers['Access-Control-Allow-Origin'] = "*"
    return ret_response

if __name__ == '__main__':
    if TEST:
        q = gen_nearby_query(24.7854333, 120.999092, 10, 20)
        pprint.pprint(run_query(q, conn))
    else:
        app.run(host='0.0.0.0', port=9999)
