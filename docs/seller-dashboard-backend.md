# Seller Dashboard Backend

## Purpose

The Seller Dashboard backend provides read-only aggregation APIs for seller business insights. It does not own product, inventory, warehouse, order, revenue, customer, or payment business logic. It queries existing module tables through a dashboard repository and exposes dashboard DTOs through the standard API response contract.

## API Routes

All routes are registered under `/api/v1/seller-dashboard`.

- `GET /overview`
- `GET /summary`
- `GET /products`
- `GET /inventory`
- `GET /warehouses`
- `GET /orders`
- `GET /revenue`
- `GET /customers`
- `GET /alerts`
- `GET /charts`
- `GET /recent-activities`
- `GET /search`

Required query input:

- `seller_id`: seller UUID

Optional date filters on overview/product/chart endpoints:

- `preset`: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `previous_month`, `quarter`, `year`, `custom`
- `start_date`: required when `preset=custom`
- `end_date`: required when `preset=custom`

## Data Sources

- Seller summary: `sellers`
- Product metrics and product trend: `products`
- Inventory metrics and alerts: `inventory`, `inventory_transactions`
- Warehouse metrics and capacity: `warehouses`, `inventory`
- Recent activity: `products`, `warehouses`, `inventory_transactions`
- Search: `products`, `inventory`, `warehouses`

Order, revenue, and customer metrics intentionally return empty zero-value DTOs until those module persistence contracts are available in this branch.

## Security

The service enforces seller ownership when the current user dependency contains a seller role and seller ID. Admin and development placeholder access follow the existing project dependency pattern. The dashboard does not introduce a new authentication implementation.

## Performance

- Aggregations use SQL projections and grouped queries.
- Dashboard search paginates after combining seller-scoped resource projections.
- Product, inventory, and warehouse metrics avoid N+1 access patterns.
- No dashboard tables or duplicated data stores are introduced.

## Verification

- `python -m pytest backend/tests`
- `python -m ruff check backend/app/api/v1/endpoints/seller_dashboard.py backend/app/repositories/seller_dashboard.py backend/app/services/seller_dashboard.py backend/app/schemas/seller_dashboard.py backend/tests/api/test_seller_dashboard.py`

Latest local verification: `128 passed`.
