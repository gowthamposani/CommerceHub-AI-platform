# API Contract

## Shared API Standards

Base URL:

```text
/api/v1
```

All modules should use a consistent response envelope for business APIs:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error responses should follow the shared exception format:

```json
{
  "success": false,
  "message": "Operation failed",
  "error_code": "ERROR_CODE",
  "details": {}
}
```

Authentication and authorization will be finalized by Developer 1 and applied to protected routes after integration.

## Developer 1 APIs

Developer 1 owns Auth, Customer, Cart, Wishlist, and Orders.

Expected contract areas:

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Auth | Developer 1 |
| `POST` | `/auth/login` | Auth | Developer 1 |
| `POST` | `/auth/logout` | Auth | Developer 1 |
| `GET` | `/auth/me` | Auth | Developer 1 |
| `GET` | `/customers/profile` | Customer | Developer 1 |
| `PUT` | `/customers/profile` | Customer | Developer 1 |
| `GET` | `/cart` | Cart | Developer 1 |
| `POST` | `/cart/items` | Cart | Developer 1 |
| `PUT` | `/cart/items/{item_id}` | Cart | Developer 1 |
| `DELETE` | `/cart/items/{item_id}` | Cart | Developer 1 |
| `GET` | `/wishlist` | Wishlist | Developer 1 |
| `POST` | `/wishlist/items` | Wishlist | Developer 1 |
| `DELETE` | `/wishlist/items/{item_id}` | Wishlist | Developer 1 |
| `GET` | `/orders` | Orders | Developer 1 |
| `POST` | `/orders` | Orders | Developer 1 |
| `GET` | `/orders/{order_id}` | Orders | Developer 1 |

Developer 1 must provide Admin integration contracts for user counts, customer counts, user status/role management, and order metrics.

## Developer 2 APIs

Developer 2 owns Seller, Products, Categories, Inventory, and Warehouse.

Expected contract areas:

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| `GET` | `/seller/profile` | Seller | Developer 2 |
| `PUT` | `/seller/profile` | Seller | Developer 2 |
| `GET` | `/seller/requests` | Seller | Developer 2 |
| `PATCH` | `/seller/requests/{request_id}/status` | Seller | Developer 2 |
| `GET` | `/products` | Products | Developer 2 |
| `POST` | `/products` | Products | Developer 2 |
| `GET` | `/products/{product_id}` | Products | Developer 2 |
| `PUT` | `/products/{product_id}` | Products | Developer 2 |
| `DELETE` | `/products/{product_id}` | Products | Developer 2 |
| `GET` | `/categories` | Categories | Developer 2 |
| `POST` | `/categories` | Categories | Developer 2 |
| `PUT` | `/categories/{category_id}` | Categories | Developer 2 |
| `DELETE` | `/categories/{category_id}` | Categories | Developer 2 |
| `GET` | `/inventory` | Inventory | Developer 2 |
| `PUT` | `/inventory/{inventory_id}` | Inventory | Developer 2 |
| `GET` | `/warehouse` | Warehouse | Developer 2 |
| `POST` | `/warehouse/shipments` | Warehouse | Developer 2 |

Developer 2 must provide Admin integration contracts for seller counts, pending seller requests, product counts, category analytics, inventory metrics, and warehouse metrics.

## Developer 3 APIs

Developer 3 owns Admin, AI, and Notifications.

Implemented or placeholder-backed contracts:

| Method | Endpoint | Module | Status |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin | Implemented with placeholders |
| `GET` | `/admin/analytics` | Admin | Implemented with placeholders |
| `GET` | `/admin/users` | Admin | Placeholder until Developer 1 User contract |
| `GET` | `/admin/users/{user_id}` | Admin | Placeholder until Developer 1 User contract |
| `PATCH` | `/admin/users/{user_id}/status` | Admin | Placeholder until Developer 1 User contract |
| `PATCH` | `/admin/users/{user_id}/role` | Admin | Placeholder until Developer 1 User contract |
| `POST` | `/ai/product-description` | AI | Implemented with provider abstraction |
| `POST` | `/notifications/send` | Notifications | Implemented with mock provider |
| `GET` | `/notifications/templates` | Notifications | Implemented with mock provider |
| `GET` | `/notifications/history` | Notifications | Implemented with mock provider |

Developer 3 must not implement Developer 1 or Developer 2 business modules. Admin metrics should consume their service/repository contracts after merge.

## Known Cross-Team Contract Notes

- Admin user management depends on Developer 1 User/Auth contracts.
- Admin dashboard order and revenue metrics depend on Developer 1 Orders contracts.
- Admin seller/product/category/inventory metrics depend on Developer 2 contracts.
- Notification recipient resolution depends on Developer 1 identity contracts.
- AI product metadata enrichment may depend on Developer 2 Product contracts later.

Detailed Developer 3 module documentation:

- [Admin Module Documentation](admin-module.md)
- [AI Module Documentation](ai-module.md)
- [Notification Module Documentation](notification-module.md)
