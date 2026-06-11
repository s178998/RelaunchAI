from fastapi import FastAPI

from app.api.routes import users
from app.core.config import settings
from app.core.database import Base, engine

# Create tables on startup. For real migrations, swap this for Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.include_router(users.router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
