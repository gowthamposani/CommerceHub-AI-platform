# CommerceHub AI
 
## Project Overview
 
CommerceHub AI is an Enterprise Multi-Vendor E-commerce Platform that enables multiple sellers to list products, customers to purchase them, and administrators to manage the marketplace.
 
---
 
# Technology Stack
 
## Frontend
 
- React

- TypeScript

- Tailwind CSS

- Axios
 
## Backend
 
- Python

- FastAPI

- SQLAlchemy

- Alembic

- PostgreSQL
 
## AI
 
- LangChain

- OpenAI Compatible LLM
 
## DevOps
 
- Docker

- GitHub Actions
 
## Testing
 
- Pytest

- Playwright
 
---
 
# High Level Architecture
 
Customer / Seller / Admin
 
↓
 
React Frontend
 
↓
 
Axios
 
↓
 
FastAPI
 
↓
 
Service Layer
 
↓
 
Repository Layer
 
↓
 
PostgreSQL
 
---
 
# Backend Architecture
 
Request
 
↓
 
Router
 
↓
 
Service
 
↓
 
Repository
 
↓
 
Database
 
---
 
# Folder Structure
 
backend/
 
frontend/
 
docs/
 
docker/
 
scripts/
 
---
 
# Authentication
 
JWT Authentication
 
Refresh Token
 
Role Based Access Control
 
---
 
# User Roles
 
Customer
 
Seller
 
Admin
 
---
 
# Deployment
 
Docker Compose
 
GitHub Actions
 
 
 
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