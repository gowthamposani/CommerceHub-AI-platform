# Integration Points

## Developer 1 Dependencies

Developer 1 owns authentication, users, customers, sellers, and role-based access control.

Developer 3 integration points:

- Admin user list should integrate with Developer 1 User module.
- Admin user detail should integrate with Developer 1 User module.
- User status and role updates should call Developer 1 User service/repository contracts.
- Admin routes should add authentication and authorization dependencies after JWT and roles are available.
- Notifications should integrate with Developer 1 user identity and recipient lookup.
- Settings profile data should integrate with Developer 1 auth/profile APIs.

## Developer 2 Dependencies

Developer 2 owns products, categories, inventory, orders, and related commerce workflows.

Developer 3 integration points:

- Dashboard product counts should integrate with Product module.
- Dashboard order counts and revenue should integrate with Orders module.
- Analytics best-selling category should integrate with Categories and Orders modules.
- Analytics low-stock products should integrate with Inventory module.
- Recent orders UI should integrate with Orders module.
- Category analytics should integrate with Category/Product reporting contracts.

## Shared Infrastructure Dependencies

Future shared infrastructure should define:

- Authentication dependency contract
- Authorization/role dependency contract
- Database session dependency contract
- Audit logging contract
- Error code registry
- Pagination and filtering standards
- Event/notification publishing contract

## Current Placeholder Strategy

Until external modules are merged:

- Admin repository returns deterministic placeholder values.
- AI providers return deterministic mock content unless provider keys are configured.
- Notification provider returns deterministic mock responses.
- Frontend displays empty states when API data is unavailable.
