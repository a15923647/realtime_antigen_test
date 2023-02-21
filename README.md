# 台灣實名制快篩地圖
NYCU DB final project
[demo video link](https://youtu.be/RUqnVx9qJPE)
# 更: 因AWS課程關閉，資料庫已死
## [地圖連結](https://a15923647.github.io/realtime_antigen_test/)
每30秒更新一次的實名制快篩地圖，列出最近的400個購買點
# 功能
1. 實際路程計算
2. 快篩數量變化趨勢圖 *(Must use DB)*
3. 動態更新 (實際距離外)
4. 全台快篩餘量 *(Must use DB)*
# 安裝
1. Replace host location and port defined in app.js with your domain and port number.
2. install docker and docker compose
   ```command
   $ sudo chmod +x install_docker.sh
   $ sudo ./install_docker.sh
   ```
3. Please refer README.md in docker_compose for futhur installation.
# Used Docker containers
* [osrm-backend](https://github.com/Project-OSRM/osrm-backend)
* [swag](https://github.com/linuxserver/docker-swag)
