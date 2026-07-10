# Setup Guide

## Local Setup

Backend:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m compileall backend/app
uvicorn backend.app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Testing:

```bash
pytest
cd frontend
npm run lint
npm run build
npm run test:e2e:typecheck
npx playwright install
npx playwright test
```

Docker:

```bash
docker compose -f docker/docker-compose.yml up --build
```

See:

- [Docker Setup](docker-setup.md)
- [Testing Guide](testing-guide.md)
- [Playwright Guide](playwright-guide.md)
