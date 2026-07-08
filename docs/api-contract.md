# API Contract
# API Contract

 

Base URL

 

/api/v1

 

---

 

## Authentication

 

POST /auth/register

 

POST /auth/login

 

POST /auth/refresh

 

GET /auth/me

 

POST /auth/logout

 

---

 

## Products

 

GET /products

 

GET /products/{id}

 

POST /products

 

PUT /products/{id}

 

DELETE /products/{id}

 

---

 

## Categories

 

GET /categories

 

POST /categories

 

---

 

## Cart

 

GET /cart

 

POST /cart

 

PUT /cart/{id}

 

DELETE /cart/{id}

 

---

 

## Wishlist

 

GET /wishlist

 

POST /wishlist

 

DELETE /wishlist/{id}

 

---

 

## Orders

 

POST /orders

 

GET /orders

 

GET /orders/{id}

 

---

 

## Reviews

 

POST /reviews

 

GET /reviews/{productId}

 

---

 

## AI

 

POST /ai/chat

 

POST /ai/recommendation

 

POST /ai/product-description

 

---

 

## Admin

 

GET /admin/users

 

GET /admin/sellers

 

PUT /admin/seller/approve

 

GET /admin/analytics

 

---

 

# Success Response

 

{

    "success": true,

    "message": "",

    "data": {}

}

 

---

 

# Error Response

 

{

    "success": false,

    "message": ""

}

 

 

 

 

 

 

----# User Flows

 

---

 

## Customer

 

Landing

 

↓

 

Register

 

↓

 

Login

 

↓

 

Browse Products

 

↓

 

Search

 

↓

 

Product Details

 

↓

 

Wishlist

 

↓

 

Cart

 

↓

 

Checkout

 

↓

 

Orders

 

↓

 

Review

 

---

 

## Seller

 

Register

 

↓

 

Admin Approval

 

↓

 

Login

 

↓

 

Dashboard

 

↓

 

Products

 

↓

 

Inventory

 

↓

 

Orders

 

↓

 

Revenue

 

---

 

## Admin

 

Login

 

↓

 

Dashboard

 

↓

 

Approve Sellers

 

↓

 

Manage Categories

 

↓

 

Reports

 

↓

 

Analytics

 

---

 

## Order Flow

 

Placed

 

↓

 

Confirmed

 

↓

 

Packed

 

↓

 

Shipped

 

↓

 

Delivered

 

---

 

## AI Flow

 

Generate Product Description

 

↓

 

Chat Support

 

↓

 

Recommendations

 
# User Flows

 

---

 

## Customer

 

Landing

 

↓

 

Register

 

↓

 

Login

 

↓

 

Browse Products

 

↓

 

Search

 

↓

 

Product Details

 

↓

 

Wishlist

 

↓

 

Cart

 

↓

 

Checkout

 

↓

 

Orders

 

↓

 

Review

 

---

 

## Seller

 

Register

 

↓

 

Admin Approval

 

↓

 

Login

 

↓

 

Dashboard

 

↓

 

Products

 

↓

 

Inventory

 

↓

 

Orders

 

↓

 

Revenue

 

---

 

## Admin

 

Login

 

↓

 

Dashboard

 

↓

 

Approve Sellers

 

↓

 

Manage Categories

 

↓

 

Reports

 

↓

 

Analytics

 

---

 

## Order Flow

 

Placed

 

↓

 

Confirmed

 

↓

 

Packed

 

↓

 

Shipped

 

↓

 

Delivered

 

---

 

## AI Flow

 

Generate Product Description

 

↓

 

Chat Support

 

↓

 

Recommendations

 
