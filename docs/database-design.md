# Database Design

## Database

PostgreSQL

---

# Tables

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

# Users

| Column | Type |
|---------|------|
| id | UUID |
| first_name | varchar |
| last_name | varchar |
| email | varchar |
| password | varchar |
| role_id | UUID |
| status | enum |
| created_at | timestamp |

---

# Roles

ADMIN

SELLER

CUSTOMER

---

# Categories

id

name

description

---

# Products

id

seller_id

category_id

title

description

price

stock

image

status

---

# Orders

id

customer_id

payment_id

status

total_amount

---

# Relationships

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