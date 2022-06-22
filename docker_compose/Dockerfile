FROM ubuntu:20.04
ENV WD=/realtime_antigen_backend/
WORKDIR ${WD}
COPY ./backend/* ${WD}
RUN apt-get update -y && \
  cd ${WD} && apt-get install -y python3 python3-pip && \
  pip3 install -r requirements.txt
CMD ["python3", "app.py"]
