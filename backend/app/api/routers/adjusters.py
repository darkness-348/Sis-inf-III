from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.infrastructure.repositories import AdjusterRepository
from app.api.schemas import AdjusterResponse

router = APIRouter(prefix="/api/adjusters", tags=["Adjusters"])

@router.get("", response_model=List[AdjusterResponse])
def get_all_adjusters(db: Session = Depends(get_db)):
    repo = AdjusterRepository(db)
    adjusters = repo.get_all()
    return [
        AdjusterResponse(
            id=a.id,
            full_name=a.full_name,
            specialty=a.specialty,
            phone=a.phone,
            email=a.email,
            is_active=a.is_active,
            active_claims_count=a.active_claims_count
        ) for a in adjusters
    ]
