FROM python:3.7-slim

COPY . . 

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir sqlalchemy pandas psycopg2-binary

EXPOSE 5432

CMD python ./migrate.py