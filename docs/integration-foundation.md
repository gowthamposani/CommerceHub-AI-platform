# Prompt 1C Integration Foundation

## Overview

Prompt 1C connects the existing backend and frontend foundations into one enterprise application. It does not implement Seller, Product, Category, Brand, Inventory, Warehouse, Dashboard, Authentication, Customer, Orders, Payments, Reviews, Notifications business logic, AI, Analytics, Admin, CRUD APIs, or business tables.

## Integration Architecture

```text
Browser
  -> Nginx
    -> React frontend
    -> FastAPI backend
      -> PostgreSQL
      -> Redis
      -> Celery worker
```

The frontend communicates with the backend only through the centralized Axios API layer in `frontend/src/api`.

## Global API Contract

Success:

```json
{
  "success": true,
  "message": "",
  "data": {},
  "timestamp": "",
  "requestId": ""
}
```

Error:

```json
{
  "success": false,
  "message": "",
  "errors": [],
  "timestamp": "",
  "requestId": ""
}
```

## Local Setup

Backend:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Docker Setup

```bash
cp docker/.env.example .env
docker compose up --build
```

Open `http://localhost:8080`.

## Health Checks

- `GET /health`
- `GET /health/live`
- `GET /health/ready`
- `GET /api/v1/health`

Readiness validates application status, database connectivity, Redis connectivity, and Celery configuration.

## Testing

Backend:

```bash
cd backend
pytest
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
npm run test:e2e
```

## Developer Guidelines

- Register future backend APIs under `backend/app/api/v1`.
- Reuse backend services, repositories, database sessions, response models, and exception handlers.
- Register future frontend routes through `frontend/src/routes/router.tsx`.
- Reuse `frontend/src/api/client.ts` for all HTTP communication.
- Reuse shared UI, form, table, loading, error, and notification foundations.
- Keep all configuration external through environment variables.

