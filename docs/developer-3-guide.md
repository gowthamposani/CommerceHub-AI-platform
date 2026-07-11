# Developer 3 Guide

## Scope

Developer 3 owns the CommerceHub AI Admin, Analytics, AI, Notifications, testing, Docker support, and related documentation surfaces.

Developer 3 code currently includes:

- Backend Admin APIs under `backend/app/api/admin/`
- Backend AI APIs under `backend/app/api/ai/`
- Backend Notification APIs under `backend/app/api/notifications/`
- Shared service, repository, schema, provider, logging, exception, and middleware infrastructure used by those modules
- Admin frontend pages and layout under `frontend/src/pages/admin/`, `frontend/src/components/`, `frontend/src/layouts/`, `frontend/src/hooks/`, `frontend/src/services/`, and `frontend/src/types/`
- Pytest infrastructure under `backend/tests/`
- Playwright infrastructure under `frontend/tests/`
- Docker and CI configuration

## Architecture

Backend flow:

```text
FastAPI Route
  -> Service Layer
  -> Repository or Provider Abstraction
  -> Placeholder data, external AI provider, or notification provider
```

Frontend flow:

```text
Admin Page
  -> Hook
  -> Service
  -> Axios Client
  -> Backend API
```

AI flow:

```text
AI Route
  -> AIService
  -> AIProvider abstraction
  -> Mock/OpenAI/Gemini provider strategy
```

Notification flow:

```text
Notification Route
  -> NotificationService
  -> NotificationProvider abstraction
  -> Mock provider
```

## Developer 3 Backend Files

- `backend/app/api/admin/routes.py`
- `backend/app/api/ai/routes.py`
- `backend/app/api/notifications/routes.py`
- `backend/app/repositories/admin_repository.py`
- `backend/app/services/admin_service.py`
- `backend/app/services/ai_service.py`
- `backend/app/services/notification_service.py`
- `backend/app/schemas/admin_schema.py`
- `backend/app/schemas/ai_schema.py`
- `backend/app/schemas/notification_schema.py`
- `backend/app/utils/ai_provider.py`
- `backend/app/utils/notification_provider.py`
- `backend/app/core/exceptions.py`
- `backend/app/core/logging.py`
- `backend/app/middleware/request_logging.py`

## Developer 3 Frontend Files

- `frontend/src/layouts/AdminLayout.tsx`
- `frontend/src/components/layout/AdminSidebar.tsx`
- `frontend/src/components/layout/AdminTopNavigation.tsx`
- `frontend/src/components/layout/AppFooter.tsx`
- `frontend/src/components/admin/*`
- `frontend/src/pages/admin/Dashboard.tsx`
- `frontend/src/pages/admin/Analytics.tsx`
- `frontend/src/pages/admin/AIProductGenerator.tsx`
- `frontend/src/pages/admin/Notifications.tsx`
- `frontend/src/pages/admin/Settings.tsx`
- `frontend/src/hooks/useDashboard.ts`
- `frontend/src/hooks/useAnalytics.ts`
- `frontend/src/hooks/useAIGenerator.ts`
- `frontend/src/hooks/useNotifications.ts`
- `frontend/src/services/admin.service.ts`
- `frontend/src/services/ai.service.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/types/admin.ts`
- `frontend/src/types/ai.ts`

## Development Rules

- Do not implement authentication, customer, seller, orders, products, categories, or inventory business modules.
- Keep placeholder repository/provider implementations until Developer 1 and Developer 2 contracts are merged.
- Do not hardcode secrets.
- Keep API responses in the existing `{ success, message, data }` envelope.
- Keep repository transaction ownership out of repositories.
- Keep FastAPI dependency injection at route boundaries.
- Keep frontend API calls inside service classes and hooks.
- Keep Playwright tests under `frontend/tests/`.

## Validation Checklist

Run before opening a pull request:

```bash
python -m compileall backend/app
pytest
cd frontend
npm install
npm run lint
npm run build
npm run test:e2e:typecheck
npx playwright install
npx playwright test
```

If Docker Desktop is installed:

```bash
docker compose -f docker/docker-compose.yml up --build
```
