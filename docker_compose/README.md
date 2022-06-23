# install
## setup api domain
First, grant executable permission to osrm_backend/pre_run.sh
```command
chmod +x osrm_backend/pre_run.sh
```
modify files below
* docker-compose.yml
  Change URL and SUBDOMAIN, environment variables of swag, to your URL and subdomain respectly.
  Don't forget to fill EMAIL field.
* *.subdomain.conf
  First, rename www.subdomain.conf to {SUBDOMAIN you set in docker-compose.yml}.subdomain.conf.
  ```command
  $ mkdir -p ./config/nginx/proxy-confs/
  $ cp {SUBDOMAIN you set in docker-compose.yml}.subdomain.conf ./config/nginx/proxy-confs/
  ```
  Also, substitude value of server_name www.* to {SUBDOMAIN you set in docker-compose.yml}.* inside.
* fill in postgreSQL database info
  Fill in the database information of a postgreSQL server into backend/rds_config.py and update/rds_config.py
In the end
```command
$ sudo docker-compose up -d
```
