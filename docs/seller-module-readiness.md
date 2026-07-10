# Seller Module Production Readiness

This document captures the Prompt 2C verification layer for the Seller module. It extends the existing backend, frontend, Docker, API, and testing foundations without adding business modules outside Developer 2 ownership.

## Scope

- Seller API endpoints under `/api/v1/sellers`
- Seller PostgreSQL table, indexes, constraints, UUID primary keys, timestamps, and soft delete fields
- Seller React pages and reusable seller components
- Backend pytest coverage for API behavior, validation, response contracts, database metadata, rollback, and soft delete persistence
- Playwright browser coverage for the seller workflow against a real backend
- Postman collection examples for health and seller APIs

## Backend Verification

Run from the repository root:

```bash
cd backend
python -m pytest tests
alembic upgrade head
alembic downgrade -1
alembic upgrade head
```

Seller tests cover create, update, view, delete, activate, deactivate, duplicate GST, duplicate PAN, duplicate email, invalid payloads, pagination, filtering, searching, sorting, rollback, and soft delete persistence.

## Frontend Verification

Run from `frontend/`:

```bash
npm install
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

The default Playwright smoke suite verifies that the foundation renders. Seller E2E tests are real integration tests and are skipped unless a backend is available:

```bash
E2E_SELLER_API_URL=http://localhost:8000/api/v1 \
VITE_API_BASE_URL=http://localhost:8000/api/v1 \
npm run test:e2e
```

The seller E2E flow creates its own seller record through the UI, updates it, searches it, filters it, toggles status, and deletes it through the backend API. It does not mock APIs or depend on seeded data.

## Docker Verification

Run from the repository root:

```bash
docker compose config
docker compose up --build
```

Then verify:

- Frontend: `http://localhost:3000`
- Backend Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Readiness: `http://localhost:8000/health/ready`

## Security And Performance Notes

- Seller queries use SQLAlchemy expression parameters and allow-listed sort columns.
- Validation is enforced in Pydantic schemas and React Hook Form/Zod UI validation.
- Unique database constraints protect GST, PAN, and business email.
- Indexed columns cover business name, GST, PAN, business email, status, and user reference.
- Pagination is performed at the database query level.
- Soft delete hides deleted sellers from active reads while preserving auditability.

## Postman

Use `docs/postman/CommerceHub.postman_collection.json`. Set `baseUrl`, `apiBaseUrl`, and `sellerId` variables before running seller detail, update, activate, deactivate, and delete requests.
