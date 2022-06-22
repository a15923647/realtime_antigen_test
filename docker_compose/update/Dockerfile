FROM python:3
WORKDIR /update
COPY requirements.txt /update/
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
CMD [ "python", "update.py" ]
