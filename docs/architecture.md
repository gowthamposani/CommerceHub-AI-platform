# Architecture

## Shared Enterprise Architecture

CommerceHub AI follows a layered enterprise architecture for all backend modules:

```text
API Route -> Service Layer -> Repository Layer -> Database
```

Provider-based modules follow this variation:

```text
API Route -> Service Layer -> Provider Interface -> External Provider or Mock Provider
```

Frontend modules follow this architecture:

```text
Page -> Component -> Hook -> Service -> Axios Client -> Backend API
```

## Backend Structure

```text
backend/app/api/           API route modules
backend/app/services/      Business orchestration
backend/app/repositories/  Database access only
backend/app/schemas/       Pydantic request/response contracts
backend/app/models/        SQLAlchemy models
backend/app/core/          Configuration, logging, exceptions, security
backend/app/middleware/    Shared middleware
backend/app/utils/         Shared utilities and provider abstractions
```

Repositories are the only layer allowed to access SQLAlchemy/database sessions.
Services coordinate business flow and transaction ownership.
Routes only handle HTTP concerns, validation, dependency injection, and response models.

## Frontend Structure

```text
frontend/src/pages/        Route-level pages
frontend/src/components/   Reusable UI components
frontend/src/layouts/      Shared application layouts
frontend/src/hooks/        Data-fetching and UI state hooks
frontend/src/services/     API service classes/functions
frontend/src/types/        TypeScript contracts
frontend/src/lib/          Shared clients and low-level utilities
```

Frontend pages must not call Axios directly. API calls flow through hooks and services.

## Developer 1 Flow

Developer 1 owns Auth, Customer, Cart, Wishlist, and Orders.

Expected backend flow:

```text
Auth/Customer/Cart/Wishlist/Orders Route
  -> Service
  -> Repository
  -> SQLAlchemy Model
  -> PostgreSQL
```

Expected frontend flow:

```text
Customer/Auth Page
  -> Customer/Auth Component
  -> Hook
  -> Service
  -> Axios Client
  -> Backend API
```

Developer 1 provides contracts for:

- Authentication and JWT validation
- Role/permission dependencies
- User/customer identity
- Cart and wishlist state
- Order creation and order history
- Order metrics needed by Admin analytics

## Developer 2 Flow

Developer 2 owns Seller, Products, Categories, Inventory, and Warehouse.

Expected backend flow:

```text
Seller/Product/Category/Inventory/Warehouse Route
  -> Service
  -> Repository
  -> SQLAlchemy Model
  -> PostgreSQL
```

Expected frontend flow:

```text
Seller/Product/Inventory Page
  -> Seller/Product Component
  -> Hook
  -> Service
  -> Axios Client
  -> Backend API
```

Developer 2 provides contracts for:

- Seller onboarding and seller profile data
- Product catalog management
- Category management
- Inventory and low-stock reporting
- Warehouse operations
- Product/category metrics needed by Admin analytics

## Developer 3 Flow

Developer 3 owns Admin, AI, Notifications, DevOps, and Testing.

Admin backend flow:

```text
Admin Route
  -> Admin Service
  -> Admin Repository
  -> Placeholder data now
  -> Developer 1/2 contracts after integration
```

AI backend flow:

```text
AI Route
  -> AI Service
  -> AI Provider Interface
  -> Mock/Gemini/OpenAI Provider
```

Notification backend flow:

```text
Notification Route
  -> Notification Service
  -> Notification Provider Interface
  -> Mock Provider now
  -> Email/SMS/Push/In-App provider later
```

Admin frontend flow:

```text
Admin Page
  -> Admin Component
  -> Hook
  -> Admin/AI Service
  -> Axios Client
  -> Backend API
```

Developer 3 consumes future contracts from Developer 1 and Developer 2 but must not directly implement their modules.

## Cross-Cutting Standards

- Standard API prefix: `/api/v1`
- Standard response envelope for business APIs
- Pydantic v2 schemas for request and response contracts
- SQLAlchemy repositories for database access
- Structured logging
- Request/response logging middleware
- Global exception handling
- Environment-based configuration
- Dockerized backend/frontend/PostgreSQL/Redis development stack
- Pytest backend validation
- Playwright frontend E2E validation

## Integration Rule

Each developer owns their module implementation, but shared files such as `architecture.md`, `api-contract.md`, `README.md`, `backend/app/main.py`, shared configuration, and frontend routing must be changed through team-reviewed pull requests.
