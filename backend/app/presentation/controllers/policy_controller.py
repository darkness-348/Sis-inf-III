from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.infrastructure.repositories import PolicyRepository
from app.application.use_cases.policy_use_cases import PolicyUseCases
from app.presentation.schemas.api_schemas import PolicyResponse
from app.presentation.controllers.auth_controller import get_current_user
from app.domain.entities import User
from app.domain.exceptions import PolicyNotFoundException

router = APIRouter(prefix="/api/policies", tags=["Policies"], dependencies=[Depends(get_current_user)])

@router.get("", response_model=List[PolicyResponse])
def get_all_policies(db: Session = Depends(get_db)):
    repo = PolicyRepository(db)
    use_cases = PolicyUseCases(repo)
    return use_cases.get_all_policies()

@router.get("/{policy_number}", response_model=PolicyResponse)
def get_policy_by_number(policy_number: str, db: Session = Depends(get_db)):
    repo = PolicyRepository(db)
    use_cases = PolicyUseCases(repo)
    try:
        return use_cases.get_policy(policy_number)
    except PolicyNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
