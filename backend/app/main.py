from fastapi import FastAPI
from app.api.routes.user_router import router as user_router
from app.api.routes.auth_router import router as auth_router
from app.core.database import engine, Base
from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# Include both routers
app.include_router(user_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}