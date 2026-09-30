from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, PolicyType

# Policy DTOs
class PolicyResponse(BaseModel):
    id: int
    policy_number: str
    insured_name: str
    insured_document: str
    policy_type: PolicyType
    coverage_amount: float
    start_date: date
    end_date: date
    status: PolicyStatus

# Adjuster DTOs
class AdjusterResponse(BaseModel):
    id: int
    full_name: str
    specialty: str
    phone: str
    email: str
    is_active: bool
    active_claims_count: int

# Claim Registration DTO
class ClaimCreateRequest(BaseModel):
    policy_number: Optional[str] = Field(None, example="POL-2026-8801")
    incident_date: date = Field(..., example="2026-09-20")
    incident_description: str = Field(..., example="Colisión frontal en intersección con daños en parachoques y motor.")
    incident_location: str = Field(..., example="Av. Las Américas 104, Ciudad")
    claimed_amount: float = Field(..., example=12500.0)
    bank_account_number: Optional[str] = Field(None, example="CTA-BNC-88019482")

class AssignAdjusterRequest(BaseModel):
    adjuster_id: int

class DamageAssessmentRequest(BaseModel):
    adjuster_id: int
    description: str
    estimated_cost: float
    labor_cost: float
    parts_cost: float

class PaymentAuthorizationRequest(BaseModel):
    authorized_by: str
    notes: Optional[str] = None

class DamageAssessmentResponse(BaseModel):
    id: int
    claim_id: int
    adjuster_id: int
    assessment_date: datetime
    description: str
    estimated_cost: float
    labor_cost: float
    parts_cost: float
    approved_by_adjuster: bool

class FraudAnalysisResponse(BaseModel):
    id: int
    claim_id: int
    total_score: int
    risk_level: FraudRiskLevel
    triggered_rules: List[str]
    analysis_notes: str
    analyzed_at: datetime

class PaymentAuthorizationResponse(BaseModel):
    id: int
    claim_id: int
    authorized_amount: float
    required_level: ApprovalLevel
    authorized_by: str
    status: str
    authorization_date: Optional[datetime]
    notes: Optional[str]

class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    policy_number: str
    policy_id: int
    incident_date: date
    incident_description: str
    incident_location: str
    claimed_amount: float
    status: ClaimStatus
    created_at: datetime
    adjuster_id: Optional[int] = None
    fraud_risk_level: FraudRiskLevel
    authorized_payment_amount: Optional[float] = None
    assessment: Optional[DamageAssessmentResponse] = None
    fraud_analysis: Optional[FraudAnalysisResponse] = None
    payment: Optional[PaymentAuthorizationResponse] = None

class DashboardMetricsResponse(BaseModel):
    total_claims: int
    total_claimed_amount: float
    total_authorized_amount: float
    claims_by_status: dict
    high_risk_fraud_claims: int
