from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import hash_password, verify_password
import csv
from datetime import datetime
import json
import pandas as pd # type: ignore




    


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def save_to_csv(self, data_dict, filename='users_export.csv'):
        """Save dict to CSV using pandas - super simple!"""
        df = pd.DataFrame(data_dict if isinstance(data_dict, list) else [data_dict])
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"✅ Saved to {filename}")
            
            

    def create_user(self, user_data: UserCreate) -> UserResponse:
        # Check uniqueness
        if self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        # if self.repo.get_by_username(user_data.username):
        #     raise HTTPException(status_code=400, detail="Username already exists")

        # Build dict for repository
        user_dict = user_data.model_dump()
        user_dict["hashed_password"] = hash_password(user_dict.pop("password"))

        user = self.repo.create(user_dict)
        return UserResponse.model_validate(user)

    def get_user(self, user_id: int) -> UserResponse | None:
        user = self.repo.get_by_id(user_id)
        return UserResponse.model_validate(user) if user else None

    def update_user(self, user_id: int, update_data: UserUpdate) -> UserResponse | None:
        user = self.repo.update(user_id, update_data)
        return UserResponse.model_validate(user) if user else None

    def delete_user(self, user_id: int) -> bool:
        return self.repo.delete(user_id)

    def list_users(self, skip: int = 0, limit: int = 100) -> list[UserResponse]:
        users = self.repo.list_all(skip, limit)
        return [UserResponse.model_validate(u) for u in users]

    # ----- Authentication helper -----
    def authenticate_user(self, email, password: str) -> UserResponse | None:
        # Allow login with either username or email
        user = self.repo.get_by_email(email)
        if not user:
            return None
        # user.hashed_password may be typed as a SQLAlchemy Column in some contexts;
        # ensure we pass a str to verify_password
        if not verify_password(password, user.hashed_password): # type: ignore
            return None
        return user