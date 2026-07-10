# Developer TODOs

## TODOs for Developer 1

Developer 1 owns authentication, users, customers, sellers, and authorization.

Required contracts for Developer 3 integration:

- JWT authentication dependency for FastAPI routes.
- Role-based authorization dependency for Admin-only endpoints.
- User model or schema contract.
- User repository/service methods for:
  - Listing users
  - Getting a user by ID
  - Updating user status
  - Updating user role
- Seller onboarding/request count contract.
- Current authenticated Admin profile endpoint.
- Recipient lookup contract for notifications.

## TODOs for Developer 2

Developer 2 owns products, categories, inventory, orders, and commerce reporting data.

Required contracts for Developer 3 integration:

- Product count contract.
- Order count contract.
- Revenue aggregation contract.
- Best-selling category contract.
- Low-stock product count contract.
- Recent orders contract.
- Category performance contract.
- Product metadata contract for future AI generation assistance.

## Developer 3 Follow-Up TODOs

- Replace Admin placeholder repository data after Developer 1/2 contracts are merged.
- Add route-level authentication and authorization.
- Add integration tests for real Admin repository/service behavior.
- Add provider-specific tests for Gemini/OpenAI after real provider clients are implemented.
- Add notification persistence once storage ownership is finalized.
