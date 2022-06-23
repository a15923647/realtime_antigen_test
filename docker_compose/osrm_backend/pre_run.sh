#!/bin/sh
cd /data/
if ! [ -f "taiwan-latest.osm.pbf" ]; then
  apt-get update
  apt-get install -y wget
  wget https://download.geofabrik.de/asia/taiwan-latest.osm.pbf && \
  osrm-extract -p /opt/car.lua /data/taiwan-latest.osm.pbf && \
  osrm-partition /data/taiwan-latest.osrm && \
  osrm-customize /data/taiwan-latest.osrm
fi
osrm-routed --algorithm mld /data/taiwan-latest.osrm
