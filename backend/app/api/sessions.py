from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        raw_user_id = payload.get("sub")
        if raw_user_id is None:
            raise credentials_exception
        try:
            user_id = int(raw_user_id)
        except (TypeError, ValueError):
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

    user_repo = UserRepository(db)
    if token_data.user_id is None:
        raise credentials_exception
    user = user_repo.get_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user