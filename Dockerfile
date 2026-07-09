FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_MODULE=backend.app.main:app

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install -r backend/requirements.txt

COPY backend ./backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn ${APP_MODULE} --host 0.0.0.0 --port 8000"]
