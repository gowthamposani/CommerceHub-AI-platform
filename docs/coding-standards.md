# Coding Standards
# Coding Standards

## Branch Strategy

main

↓

develop

↓

feature/*

---

## Commit Messages

feat:

fix:

refactor:

docs:

test:

chore:

---

## Folder Ownership

Developer 1

- Authentication
- Customer
- Cart
- Orders

Developer 2

- Products
- Seller
- Categories

Developer 3

- Admin
- AI
- Deployment

---

## API Rules

Never rename endpoints.

Always use REST naming.

---

## Database Rules

Never rename columns.

Never change relationships without discussion.

---

## Response Format

{
    "success": true,
    "message": "",
    "data": {}
}

---

## Code Style

Repository Pattern

Service Layer

Dependency Injection

Environment Variables

Logging

Exception Handling

---

## Pull Requests

One feature

One PR

Review required before merge