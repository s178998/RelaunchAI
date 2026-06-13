import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext  # optional, but nice; we'll keep bcrypt directly

# ---------- Password hashing ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()


def verify_password(plain_password: str, hashed_password) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password)


# ---------- JWT ----------
from app.core.config import settings

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)