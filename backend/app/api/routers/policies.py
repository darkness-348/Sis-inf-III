from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.infrastructure.repositories import PolicyRepository
from app.use_cases.policy_use_cases import PolicyUseCases
from app.api.schemas import PolicyResponse, PolicyCreateRequest
from app.domain.exceptions import PolicyNotFoundException, DomainException

router = APIRouter(prefix="/api/policies", tags=["Policies"])

@router.get("", response_model=List[PolicyResponse])
def get_all_policies(db: Session = Depends(get_db)):
    repo = PolicyRepository(db)
    use_cases = PolicyUseCases(repo)
    return use_cases.get_all_policies()

@router.post("", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
def register_policy(req: PolicyCreateRequest, db: Session = Depends(get_db)):
    repo = PolicyRepository(db)
    use_cases = PolicyUseCases(repo)
    try:
        return use_cases.register_policy(
            insured_name=req.insured_name,
            insured_document=req.insured_document,
            policy_type=req.policy_type,
            coverage_amount=req.coverage_amount,
            start_date=req.start_date,
            end_date=req.end_date,
            status=req.status,
            bank_account_number=req.bank_account_number,
            policy_number=req.policy_number
        )
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{policy_number}", response_model=PolicyResponse)
def get_policy_by_number(policy_number: str, db: Session = Depends(get_db)):
    repo = PolicyRepository(db)
    use_cases = PolicyUseCases(repo)
    try:
        return use_cases.get_policy(policy_number)
    except PolicyNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
