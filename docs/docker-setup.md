# Docker Setup

## Purpose

Docker configuration supports local development for:

- Backend FastAPI app
- Frontend Vite app
- PostgreSQL
- Redis

## Files

- `docker/backend.Dockerfile`
- `docker/frontend.Dockerfile`
- `docker/docker-compose.yml`
- `docker-compose.yml`
- `.dockerignore`
- `backend/.env.example`
- `frontend/.env.example`

## Start Stack

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Services

| Service | URL or Port |
| --- | --- |
| Backend | `http://localhost:8000` |
| Swagger | `http://localhost:8000/docs` |
| Health | `http://localhost:8000/health` |
| Frontend | `http://localhost:5173` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## Development Behavior

- Backend mounts `backend/` into the container.
- Backend runs Uvicorn with hot reload.
- Frontend mounts `frontend/` into the container.
- Frontend uses a named Docker volume for `node_modules`.
- Frontend runs Vite with hot reload.

## Environment Files

Create local private env files if needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Do not commit `.env` files.

## Docker Desktop on macOS

Install:

```bash
brew install --cask docker
open -a Docker
docker version
docker compose version
```

## Known Limitation

Docker runtime validation requires Docker Desktop and Docker Engine to be installed and running locally. If `docker` is unavailable, YAML validation can still be performed, but containers cannot start.
