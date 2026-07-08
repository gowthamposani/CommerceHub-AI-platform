FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_MODULE=backend.app.main:app

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install \
    fastapi==0.115.6 \
    uvicorn[standard]==0.34.0 \
    pydantic[email]==2.10.4 \
    SQLAlchemy==2.0.36 \
    psycopg2-binary==2.9.10

COPY backend ./backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn ${APP_MODULE} --host 0.0.0.0 --port 8000"]
