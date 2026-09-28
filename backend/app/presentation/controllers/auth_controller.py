from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories import UserRepository
from app.application.use_cases.auth_use_cases import AuthUseCases
from app.presentation.schemas.api_schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
)
from app.domain.exceptions import DomainException, UnauthorizedException
from app.domain.entities import User

router = APIRouter(prefix="/api/auth", tags=["Authentication & Security"])

# HTTPBearer Security Scheme (Enables Swagger Lock Icon 🔒)
security = HTTPBearer()

def get_auth_use_cases(db: Session = Depends(get_db)) -> AuthUseCases:
    user_repo = UserRepository(db)
    return AuthUseCases(user_repo)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    auth_cases = get_auth_use_cases(db)
    try:
        return auth_cases.get_current_user_from_token(token)
    except DomainException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, use_cases: AuthUseCases = Depends(get_auth_use_cases)):
    try:
        user = use_cases.register_user(
            username=req.username,
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            role=req.role
        )
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, use_cases: AuthUseCases = Depends(get_auth_use_cases)):
    try:
        user, token = use_cases.authenticate_user(req.username, req.password)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            username=user.username,
            full_name=user.full_name,
            role=user.role
        )
    except DomainException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active
    )
