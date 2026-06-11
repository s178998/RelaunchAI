from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserNotFoundError(Exception):
    """Raised when a requested user does not exist."""


class EmailAlreadyExistsError(Exception):
    """Raised when creating/updating a user with an email already in use."""


class UserService:
    """Business logic for users. Coordinates validation and the repository."""

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def list_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.repository.list(skip=skip, limit=limit)

    def get_user(self, user_id: int) -> User:
        user = self.repository.get(user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} not found")
        return user

    def create_user(self, data: UserCreate) -> User:
        if self.repository.get_by_email(data.email) is not None:
            raise EmailAlreadyExistsError(f"Email {data.email} is already registered")
        return self.repository.create(data)

    def update_user(self, user_id: int, data: UserUpdate) -> User:
        user = self.get_user(user_id)
        if data.email is not None and data.email != user.email:
            existing = self.repository.get_by_email(data.email)
            if existing is not None and existing.id != user.id:
                raise EmailAlreadyExistsError(f"Email {data.email} is already registered")
        return self.repository.update(user, data)

    def delete_user(self, user_id: int) -> None:
        user = self.get_user(user_id)
        self.repository.delete(user)
