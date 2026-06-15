from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.user_router import router as user_router
from app.api.routes.auth_router import router as auth_router
from app.api.routes.ai_router import router as ai_router
from app.core.database import engine, Base
from app.core.config import settings


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
    
)

# Include both routers
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}