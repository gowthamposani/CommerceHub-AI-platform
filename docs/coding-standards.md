# Coding Standards

## Developer 3 Standards

- Keep routes thin.
- Put business orchestration in services.
- Keep database access in repositories only.
- Keep external AI/notification integrations behind provider interfaces.
- Do not put transaction ownership in repositories.
- Use Pydantic v2 schemas for request and response contracts.
- Use typed React hooks and service classes for API integration.
- Use semantic locators and Page Object Model in Playwright.
- Do not commit generated artifacts, secrets, `node_modules`, build output, coverage output, or reports.
