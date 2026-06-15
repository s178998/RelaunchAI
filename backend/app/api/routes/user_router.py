# app/api/routes/user_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_service import AuthService
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.api.sessions import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.services.user_service import AuthService
from app.schemas.user import Token
from app.core.config import settings
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    service = AuthService(db)
    
    user_dict = user_data.model_dump()
    
    service.save_to_csv(user_dict)
    
    return service.create_user(user_data)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get the current authenticated user's info"""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID"""
    service = AuthService(db)
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, update_data: UserUpdate, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """Update a user (requires authentication)"""
    service = AuthService(db)
    user = service.update_user(user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """Delete a user (requires authentication)"""
    service = AuthService(db)
    if not service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/", response_model=list[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List users with pagination"""
    service = AuthService(db)
    return service.list_users(skip, limit)