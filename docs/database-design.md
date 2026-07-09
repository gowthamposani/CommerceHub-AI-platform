# Database Design

## Database

PostgreSQL

---

## Freeze Rule

Database schema is frozen before coding starts. Do not rename columns, remove columns, or change relationships without team discussion and agreement.

---

## Tables

- Users
- Roles
- Categories
- Products
- Inventory
- Cart
- CartItems
- Wishlist
- Orders
- OrderItems
- Payments
- Reviews
- Addresses
- Notifications

---

## Users

| Column | Type |
| --- | --- |
| id | UUID |
| first_name | varchar |
| last_name | varchar |
| email | varchar |
| password | varchar |
| role | enum |
| phone | varchar |
| status | enum |
| created_at | timestamp |
| updated_at | timestamp |

---

## Roles

- ADMIN
- SELLER
- CUSTOMER

---

## Categories

| Column | Type |
| --- | --- |
| id | UUID |
| name | varchar |
| description | text |

---

## Products

| Column | Type |
| --- | --- |
| id | UUID |
| seller_id | UUID |
| category_id | UUID |
| name | varchar |
| description | text |
| price | numeric |
| stock | integer |
| image | varchar |
| status | enum |

---

## Orders

| Column | Type |
| --- | --- |
| id | UUID |
| customer_id | UUID |
| status | enum |
| total_amount | numeric |
| payment_status | enum |
| created_at | timestamp |

---

## Cart

| Column | Type |
| --- | --- |
| id | UUID |
| customer_id | UUID |
| created_at | timestamp |
| updated_at | timestamp |

---

## CartItems

| Column | Type |
| --- | --- |
| id | UUID |
| cart_id | UUID |
| product_id | UUID |
| quantity | integer |
| created_at | timestamp |
| updated_at | timestamp |

---

## Wishlist

| Column | Type |
| --- | --- |
| id | UUID |
| customer_id | UUID |
| product_id | UUID |
| created_at | timestamp |

---

## Reviews

| Column | Type |
| --- | --- |
| id | UUID |
| customer_id | UUID |
| product_id | UUID |
| rating | integer |
| comment | text |
| created_at | timestamp |
| updated_at | timestamp |

---

## Relationships

Customer

↓

Orders

↓

Order Items

↓

Products

Seller

↓

Products

Category

↓

Products

Customer

↓

Cart

↓

Cart Items

Product

↓

Reviews

---

✅ Database frozen.
