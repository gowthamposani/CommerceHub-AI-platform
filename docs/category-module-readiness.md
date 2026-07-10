# Category Module Production Readiness

This document captures the Prompt 3C verification layer for Category Management. It extends the existing backend, frontend, Docker, API, and testing foundations without adding modules outside Developer 2 ownership.

## Scope

- Category APIs under `/api/v1/categories`
- Category PostgreSQL table, self-referencing hierarchy, indexes, constraints, UUID primary keys, timestamps, and soft delete fields
- Category React pages and reusable category components
- Backend pytest coverage for API behavior, validation, hierarchy rules, response contracts, database metadata, rollback, child lookup, and soft delete persistence
- Playwright browser coverage for the category workflow against a real backend
- Postman collection examples for category APIs

## Backend Verification

Run from the repository root:

```bash
cd backend
python -m pytest tests/api/test_categories.py tests/integration/test_category_database_contract.py tests/integration/test_category_repository.py
alembic upgrade head
alembic downgrade -1
alembic upgrade head
```

Category tests cover create, update, view, delete, activate, deactivate, duplicate name, duplicate slug, invalid parent, circular hierarchy, protected parent deletion, search, filtering, sorting, pagination, tree retrieval, rollback, child lookup, and soft delete persistence.

## Frontend Verification

Run from `frontend/`:

```bash
npm install
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

The category Playwright test is a real integration test and is skipped unless a backend is available:

```bash
E2E_CATEGORY_API_URL=http://localhost:8000/api/v1 \
VITE_API_BASE_URL=http://localhost:8000/api/v1 \
npm run test:e2e
```

The category E2E flow creates its own parent and child categories through the UI, updates the child, verifies tree expand/collapse, searches and filters, toggles status, and soft deletes through the backend API. It does not mock APIs or depend on seeded data.

## Docker Verification

Run from the repository root:

```bash
docker-compose config
docker-compose up --build
```

Then verify:

- Frontend: `http://localhost:8080`
- Backend Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Category API: `http://localhost:8000/api/v1/categories`

## Security And Performance Notes

- Category queries use SQLAlchemy expressions and allow-listed sort columns.
- Validation is enforced in Pydantic schemas and React Hook Form/Zod UI validation.
- Unique database constraints protect category name and slug.
- Indexed columns cover name, slug, parent, status, active, deleted, and display order.
- Tree retrieval loads non-deleted categories once and assembles hierarchy in memory.
- Pagination is performed at the database query level.
- Soft delete hides deleted categories from active reads while preserving auditability.
