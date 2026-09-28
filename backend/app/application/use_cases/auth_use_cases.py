from datetime import datetime, timedelta
from typing import Tuple
from app.domain.entities import User
from app.domain.enums import UserRole
from app.domain.exceptions import UserAlreadyExistsException, InvalidCredentialsException, UnauthorizedException
from app.application.interfaces.repository_interfaces import IUserRepository
from app.infrastructure.security import hash_password, verify_password, create_access_token, decode_access_token

class AuthUseCases:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    def register_user(
        self,
        username: str,
        email: str,
        password: str,
        full_name: str,
        role: UserRole = UserRole.ANALYST
    ) -> User:
        # Check if username or email exists
        if self.user_repo.get_by_username(username):
            raise UserAlreadyExistsException(username)
        if self.user_repo.get_by_email(email):
            raise UserAlreadyExistsException(email)

        user = User(
            id=None,
            username=username.strip(),
            email=email.strip().lower(),
            hashed_password=hash_password(password),
            full_name=full_name.strip(),
            role=role,
            is_active=True,
            created_at=datetime.now()
        )

        return self.user_repo.save(user)

    def authenticate_user(self, username: str, password: str) -> Tuple[User, str]:
        user = self.user_repo.get_by_username(username.strip())
        if not user:
            raise InvalidCredentialsException()

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise UnauthorizedException("El usuario se encuentra inactivo.")

        # Create JWT access token
        token_data = {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role.value,
            "full_name": user.full_name
        }
        token = create_access_token(data=token_data)
        return user, token

    def get_current_user_from_token(self, token: str) -> User:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if not username:
            raise UnauthorizedException("Token JWT no contiene información del usuario.")

        user = self.user_repo.get_by_username(username)
        if not user or not user.is_active:
            raise UnauthorizedException("Usuario no encontrado o inactivo.")

        return user
