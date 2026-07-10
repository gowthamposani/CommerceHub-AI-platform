# Admin Module Documentation

## Purpose

The Admin module provides operational APIs and UI surfaces for marketplace administrators. Current Sprint 1/Sprint 2 functionality uses deterministic placeholder data until User, Seller, Product, Order, Category, and Inventory modules are merged by other developers.

## Backend Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Return Admin dashboard summary metrics. |
| `GET` | `/admin/analytics` | Return Admin analytics summary metrics. |
| `GET` | `/admin/users` | Return placeholder Admin user list. |
| `GET` | `/admin/users/{user_id}` | Return one placeholder Admin user. |
| `PATCH` | `/admin/users/{user_id}/status` | Update placeholder user status. |
| `PATCH` | `/admin/users/{user_id}/role` | Update placeholder user role. |

## Response Envelope

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {}
}
```

## Dashboard Data

The dashboard response includes:

- `total_users`
- `total_customers`
- `total_sellers`
- `total_products`
- `total_orders`
- `pending_seller_requests`
- `revenue`
- `generated_at`

## Analytics Data

The analytics response includes:

- `total_revenue`
- `today_orders`
- `monthly_orders`
- `active_customers`
- `active_sellers`
- `best_selling_category`
- `low_stock_products`
- `generated_at`

## Backend Architecture

```text
backend/app/api/admin/routes.py
  -> backend/app/services/admin_service.py
  -> backend/app/repositories/admin_repository.py
  -> placeholder data
```

## Repository Rules

- Repository returns placeholder data only.
- Repository does not call `commit()` or `rollback()`.
- Repository does not import FastAPI.
- Repository includes TODO comments for external module integration.

## Service Rules

- Service prepares response envelopes.
- Service handles exceptions and logs operations.
- Service depends on repository protocol/contract.

## Frontend Admin Pages

- Dashboard: `frontend/src/pages/admin/Dashboard.tsx`
- Analytics: `frontend/src/pages/admin/Analytics.tsx`
- Users: `frontend/src/pages/admin/Users.tsx`
- Notifications: `frontend/src/pages/admin/Notifications.tsx`
- AI Tools: `frontend/src/pages/admin/AIProductGenerator.tsx`
- Settings: `frontend/src/pages/admin/Settings.tsx`

## Integration TODOs

- Replace placeholder user data with Developer 1 User/Auth module contracts.
- Replace placeholder seller request data with Developer 1 Seller contracts.
- Replace placeholder product/order/category/inventory metrics with Developer 2 contracts.
- Add authorization once authentication and roles are available.
