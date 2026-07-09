# Architecture
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