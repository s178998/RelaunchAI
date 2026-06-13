from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_service import AuthService
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.api.sessions import get_current_user  # we'll create this next
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
    return service.create_user(user_data)  # HTTPException already raised inside


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
    # Optional: add admin check if needed
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

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    user = service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}