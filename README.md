# CommerceHub AI

Enterprise Multi-Vendor E-commerce Platform.

## Runtime

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL

## Backend Startup

```bash
python3.12 -m compileall backend/app
uvicorn backend.app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```
