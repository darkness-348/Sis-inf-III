from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.infrastructure.repositories import ClaimRepository, PolicyRepository, AdjusterRepository
from app.application.use_cases.claim_use_cases import ClaimUseCases
from app.application.use_cases.payment_use_cases import PaymentUseCases
from app.application.use_cases.fraud_use_cases import FraudEngineUseCases
from app.presentation.schemas.api_schemas import (
    ClaimCreateRequest, ClaimResponse, AssignAdjusterRequest,
    DamageAssessmentRequest, PaymentAuthorizationRequest,
    PaymentAuthorizationResponse, FraudAnalysisResponse, DashboardMetricsResponse
)
from app.presentation.controllers.auth_controller import get_current_user
from app.domain.entities import User
from app.domain.exceptions import DomainException
from app.domain.enums import FraudRiskLevel

router = APIRouter(prefix="/api/claims", tags=["Claims"], dependencies=[Depends(get_current_user)])

def get_claim_use_cases(db: Session = Depends(get_db)) -> ClaimUseCases:
    claim_repo = ClaimRepository(db)
    policy_repo = PolicyRepository(db)
    adjuster_repo = AdjusterRepository(db)
    return ClaimUseCases(claim_repo, policy_repo, adjuster_repo)

def get_payment_use_cases(db: Session = Depends(get_db)) -> PaymentUseCases:
    claim_repo = ClaimRepository(db)
    return PaymentUseCases(claim_repo)

def get_fraud_use_cases(db: Session = Depends(get_db)) -> FraudEngineUseCases:
    claim_repo = ClaimRepository(db)
    policy_repo = PolicyRepository(db)
    return FraudEngineUseCases(claim_repo, policy_repo)

@router.get("", response_model=List[ClaimResponse])
def get_all_claims(use_cases: ClaimUseCases = Depends(get_claim_use_cases)):
    return use_cases.get_all_claims()

@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    repo = ClaimRepository(db)
    claims = repo.get_all()
    
    total_claims = len(claims)
    total_claimed = sum(c.claimed_amount for c in claims)
    total_authorized = sum(c.authorized_payment_amount or 0.0 for c in claims)
    
    status_counts = {}
    high_risk_count = 0
    for c in claims:
        status_str = c.status.value
        status_counts[status_str] = status_counts.get(status_str, 0) + 1
        if c.fraud_risk_level in (FraudRiskLevel.HIGH, FraudRiskLevel.CRITICAL):
            high_risk_count += 1

    return DashboardMetricsResponse(
        total_claims=total_claims,
        total_claimed_amount=total_claimed,
        total_authorized_amount=total_authorized,
        claims_by_status=status_counts,
        high_risk_fraud_claims=high_risk_count
    )

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim_by_id(claim_id: int, use_cases: ClaimUseCases = Depends(get_claim_use_cases)):
    try:
        return use_cases.get_claim_by_id(claim_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def register_claim(req: ClaimCreateRequest, use_cases: ClaimUseCases = Depends(get_claim_use_cases)):
    try:
        return use_cases.register_claim(
            policy_number=req.policy_number,
            incident_date=req.incident_date,
            incident_description=req.incident_description,
            incident_location=req.incident_location,
            claimed_amount=req.claimed_amount
        )
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{claim_id}/assign-adjuster", response_model=ClaimResponse)
def assign_adjuster(claim_id: int, req: AssignAdjusterRequest, use_cases: ClaimUseCases = Depends(get_claim_use_cases)):
    try:
        return use_cases.assign_adjuster(claim_id, req.adjuster_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{claim_id}/assessment", response_model=ClaimResponse)
def record_assessment(claim_id: int, req: DamageAssessmentRequest, use_cases: ClaimUseCases = Depends(get_claim_use_cases)):
    try:
        return use_cases.record_damage_assessment(
            claim_id=claim_id,
            adjuster_id=req.adjuster_id,
            description=req.description,
            estimated_cost=req.estimated_cost,
            labor_cost=req.labor_cost,
            parts_cost=req.parts_cost
        )
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{claim_id}/evaluate-fraud", response_model=FraudAnalysisResponse)
def evaluate_fraud(claim_id: int, fraud_cases: FraudEngineUseCases = Depends(get_fraud_use_cases)):
    try:
        return fraud_cases.evaluate_claim_fraud_risk(claim_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{claim_id}/authorize-payment", response_model=PaymentAuthorizationResponse)
def authorize_payment(
    claim_id: int, 
    req: PaymentAuthorizationRequest, 
    payment_cases: PaymentUseCases = Depends(get_payment_use_cases),
    current_user: User = Depends(get_current_user)
):
    try:
        return payment_cases.authorize_payment(
            claim_id=claim_id,
            authorized_by=req.authorized_by or current_user.full_name,
            notes=req.notes
        )
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{claim_id}/liquidate", response_model=ClaimResponse)
def liquidate_claim(
    claim_id: int, 
    authorized_by: str = "Oficial de Liquidación", 
    payment_cases: PaymentUseCases = Depends(get_payment_use_cases),
    current_user: User = Depends(get_current_user)
):
    try:
        user_name = current_user.full_name if current_user else authorized_by
        return payment_cases.liquidate_claim(claim_id, user_name)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
