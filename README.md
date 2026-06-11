# RelaunchAI

This repository contains:

- `backend/`: Python REST API using FastAPI
- `frontend/`: Next.js web frontend

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Interactive API docs are served at `http://localhost:8000/docs`.

### Architecture

The backend follows a layered controller → service → repository pattern:

```
app/
  main.py                       # FastAPI app, router wiring, table creation
  core/
    config.py                   # Settings (env-driven, pydantic-settings)
    database.py                 # SQLAlchemy engine, session, Base, get_db dep
  models/user.py                # SQLAlchemy ORM model
  schemas/user.py               # Pydantic request/response schemas
  repositories/user_repository.py  # Data access (all DB queries live here)
  services/user_service.py      # Business logic + domain errors
  api/
    deps.py                     # Dependency wiring (session → repo → service)
    routes/users.py             # HTTP layer: translates errors to status codes
```

Each layer depends only on the one below it. To add a new resource, mirror the
`user` files across `models/`, `schemas/`, `repositories/`, `services/`, and
`api/routes/`, then include the router in `main.py`.

`User` CRUD is exposed at `/users` (`GET`, `POST`, `GET/{id}`, `PATCH/{id}`,
`DELETE/{id}`). The default database is SQLite (`relaunchai.db`); override with
the `DATABASE_URL` env var for Postgres, etc.

## Frontend

```bash
cd frontend
npm install
npm run dev
```