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

## Frontend

```bash
cd frontend
npm install
npm run dev
```