# Testing Guide

## Backend Testing

Backend tests use:

- Pytest
- pytest-cov
- pytest-asyncio
- FastAPI TestClient

Run:

```bash
pytest
```

Current test infrastructure:

- `backend/tests/conftest.py`
- `backend/tests/fixtures.py`
- `backend/tests/api/sample_test.py`

Pytest configuration:

- `pytest.ini`

## Backend Validation Commands

```bash
python -m compileall backend/app
python -m pytest
```

Optional backend lint command:

```bash
python -m ruff check backend/app backend/tests
```

## Frontend Testing

Frontend validation uses:

- TypeScript build
- ESLint
- Playwright E2E

Run:

```bash
cd frontend
npm install
npm run lint
npm run build
npm run test:e2e:typecheck
npx playwright install
npx playwright test
```

## Playwright Structure

- `frontend/tests/e2e/`
- `frontend/tests/pages/`
- `frontend/tests/fixtures/`
- `frontend/tests/utils/`
- `frontend/tests/tsconfig.json`

## Playwright Coverage

Current E2E suite covers:

- Application launch
- Unknown route fallback
- Admin dashboard
- Sidebar navigation
- Analytics page
- AI Product Generator success path
- AI Product Generator validation
- AI Product Generator error handling
- Notifications page
- Settings page
- Responsive desktop/tablet/mobile layout
- Network error handling

## Reports and Artifacts

Playwright configuration:

- HTML reporter: `frontend/playwright-report/`
- Screenshots on failure
- Videos retained on failure
- Traces retained on failure

Artifacts are ignored by Git.

## Known Test Limitations

- Backend tests are currently infrastructure-focused.
- Admin service/repository tests should expand after Developer 1 and Developer 2 domain contracts stabilize.
- Playwright tests mock browser network responses and do not require Docker or a live backend.
