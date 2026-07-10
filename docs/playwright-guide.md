# Playwright Guide

## Purpose

Playwright validates the Admin frontend module through browser automation. The suite uses Page Object Model, reusable fixtures, and deterministic API mocks.

## Files

- `frontend/playwright.config.ts`
- `frontend/tests/e2e/`
- `frontend/tests/pages/`
- `frontend/tests/fixtures/`
- `frontend/tests/utils/`
- `frontend/tests/tsconfig.json`

## Commands

```bash
cd frontend
npm install
npx playwright install
npm run test:e2e:typecheck
npx playwright test
```

Open report:

```bash
npm run test:e2e:report
```

## Configuration

Playwright is configured with:

- HTML reporter
- Trace retained on failure
- Screenshot on failure
- Video retained on failure
- Retry policy
- Vite web server startup
- Base URL `http://127.0.0.1:5173`

## Page Object Model

Page objects live under `frontend/tests/pages/`:

- `admin-dashboard.page.ts`
- `admin-layout.page.ts`
- `analytics.page.ts`
- `ai-product-generator.page.ts`
- `notifications.page.ts`
- `settings.page.ts`
- `base.page.ts`

## API Mocks

Browser network mocks live in:

- `frontend/tests/utils/api-mocks.ts`

The tests do not require a live backend. They mock:

- Admin dashboard API
- Admin analytics API
- AI product description API
- Notification templates API
- Notification history API
- Notification send API
- Network failure scenarios

## Test Cases

Current suite validates:

- Application launches
- Admin dashboard loads
- Sidebar navigation works
- Analytics page opens
- AI generator input, submit, loading, success, validation, and error handling
- Notifications page loads
- Settings page loads
- Responsive desktop/tablet/mobile layout
- Unknown route fallback
- Network error handling

## Artifact Policy

Generated artifacts are ignored:

- `frontend/playwright-report/`
- `frontend/test-results/`
- Videos
- Screenshots
- Trace archives
