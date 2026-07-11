# CommerceHub AI Backend

## Project Overview

CommerceHub AI is an enterprise multi-vendor e-commerce platform. This backend foundation provides reusable infrastructure only: configuration, logging, database access, middleware, exception handling, health checks, testing, Docker, and code quality tooling.

No business modules are implemented in this foundation.

## Architecture

The backend follows Clean Architecture and keeps responsibilities separated:

```text
API Routes
Services
Repositories
Database
```

API routes validate input, call services, and return responses. Services contain business workflows. Repositories isolate persistence. SQL should not be placed in routes.

## Folder Structure

```text
backend/
  alembic/
  app/
    api/
    common/
    config/
    core/
    database/
    dependencies/
    exceptions/
    middleware/
    models/
    repositories/
    schemas/
    services/
    utils/
  docs/
  scripts/
  tests/
```

## Installation

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Running Locally

```bash
cd backend
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`.

## Running Docker

```bash
cd backend
cp .env.example .env
docker compose up --build
```

For the integrated frontend, backend, Nginx, PostgreSQL, Redis, and Celery stack, run from the repository root:

```bash
docker compose up --build
```

## Environment Variables

All runtime configuration is loaded through Pydantic Settings. Configure application metadata, database, Redis, JWT secrets, logging, middleware, and Docker settings in `.env`.

Never hardcode secrets in source files.

## Alembic Commands

```bash
cd backend
alembic revision --autogenerate -m "message"
alembic upgrade head
alembic downgrade -1
```

## Testing

```bash
cd backend
pytest
```

The test foundation includes async API client fixtures, in-memory async database fixtures, and health endpoint tests.

## Coding Standards

Use Ruff, Black, isort, and mypy:

```bash
cd backend
ruff check .
black .
isort .
mypy app tests
```

All future modules should reuse the base settings, database session dependency, repository base, service base, response models, pagination helpers, exception handlers, and middleware.

## Celery

The Celery foundation is configured in `app/celery_app.py` and uses Redis for broker and result backend. No business tasks are registered in the foundation.
