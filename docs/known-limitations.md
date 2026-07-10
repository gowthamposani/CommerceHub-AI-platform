# Known Limitations

## Backend

- Admin repository uses placeholder data.
- No real database model queries are implemented for Admin metrics.
- Authentication and authorization are not implemented in Developer 3 routes.
- AI provider integrations are stubs except for deterministic mock behavior.
- Notification providers are mock-only.

## Frontend

- Admin pages rely on API service responses and display empty states when data is unavailable.
- Settings profile/system data is placeholder until backing APIs exist.
- Some Admin service methods prepare for category/user APIs that depend on other developers' modules.

## Testing

- Backend pytest coverage is currently infrastructure-focused.
- Playwright E2E tests use browser-level API mocks and do not require Docker or live backend services.
- Failure screenshots/videos/traces are generated only when a Playwright test fails.

## Docker

- Docker runtime validation requires Docker Desktop and Docker Engine.
- If Docker is not installed, only YAML and file-level validation can run.

## Integration

- Developer 1 and Developer 2 contracts are required before replacing placeholders with production data.
