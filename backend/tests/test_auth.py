import pytest
from app.domain.entities import User
from app.domain.enums import UserRole
from app.domain.exceptions import InvalidCredentialsException, UserAlreadyExistsException
from app.infrastructure.repositories import UserRepository
from app.application.use_cases.auth_use_cases import AuthUseCases
from app.infrastructure.database import Base, engine, SessionLocal

from app.seed import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    seed_database()

def test_user_registration_and_login_success():
    db = SessionLocal()
    user_repo = UserRepository(db)
    auth_cases = AuthUseCases(user_repo)

    # Register new user
    user = auth_cases.register_user(
        username="testuser",
        email="test@upds.edu.bo",
        password="secretpassword",
        full_name="Usuario Pruebas",
        role=UserRole.ANALYST
    )

    assert user.id is not None
    assert user.username == "testuser"

    # Authenticate user
    auth_user, token = auth_cases.authenticate_user("testuser", "secretpassword")
    assert auth_user.username == "testuser"
    assert token is not None and len(token) > 10

    # Validate token
    token_user = auth_cases.get_current_user_from_token(token)
    assert token_user.username == "testuser"
    db.close()

def test_login_with_wrong_password_fails():
    db = SessionLocal()
    user_repo = UserRepository(db)
    auth_cases = AuthUseCases(user_repo)

    auth_cases.register_user(
        username="user1",
        email="user1@test.com",
        password="validpassword",
        full_name="User One"
    )

    with pytest.raises(InvalidCredentialsException):
        auth_cases.authenticate_user("user1", "wrongpassword")
    db.close()

def test_register_duplicate_username_fails():
    db = SessionLocal()
    user_repo = UserRepository(db)
    auth_cases = AuthUseCases(user_repo)

    auth_cases.register_user(
        username="duplicate",
        email="dup1@test.com",
        password="pwd",
        full_name="Dup One"
    )

    with pytest.raises(UserAlreadyExistsException):
        auth_cases.register_user(
            username="duplicate",
            email="dup2@test.com",
            password="pwd",
            full_name="Dup Two"
        )
    db.close()
