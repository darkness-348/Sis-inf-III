from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional, List
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, PolicyType, UserRole

@dataclass
class User:
    id: Optional[int]
    username: str
    email: str
    hashed_password: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: Optional[datetime] = None

@dataclass
class Policy:
    id: Optional[int]
    policy_number: str
    insured_name: str
    insured_document: str
    policy_type: PolicyType
    coverage_amount: float
    start_date: date
    end_date: date
    status: PolicyStatus
    bank_account_number: Optional[str] = "CTA-BNC-88019482"
    created_at: Optional[datetime] = None

@dataclass
class Adjuster:
    id: Optional[int]
    full_name: str
    specialty: str
    phone: str
    email: str
    is_active: bool = True
    active_claims_count: int = 0

@dataclass
class FraudRuleResult:
    rule_code: str
    rule_name: str
    score_impact: int
    is_triggered: bool
    details: str

@dataclass
class FraudAnalysis:
    id: Optional[int]
    claim_id: int
    total_score: int
    risk_level: FraudRiskLevel
    triggered_rules: List[str]
    analysis_notes: str
    analyzed_at: datetime

@dataclass
class DamageAssessment:
    id: Optional[int]
    claim_id: int
    adjuster_id: int
    assessment_date: datetime
    description: str
    estimated_cost: float
    labor_cost: float
    parts_cost: float
    approved_by_adjuster: bool

@dataclass
class PaymentAuthorization:
    id: Optional[int]
    claim_id: int
    authorized_amount: float
    required_level: ApprovalLevel
    authorized_by: str
    status: str # PENDING, AUTHORIZED, REJECTED, PAID
    authorization_date: Optional[datetime] = None
    notes: Optional[str] = None

@dataclass
class Claim:
    id: Optional[int]
    claim_number: str
    policy_number: str
    policy_id: Optional[int]
    incident_date: date
    incident_description: str
    incident_location: str
    claimed_amount: float
    status: ClaimStatus
    created_at: datetime
    adjuster_id: Optional[int] = None
    fraud_risk_level: FraudRiskLevel = FraudRiskLevel.LOW
    authorized_payment_amount: Optional[float] = None
    bank_account_number: Optional[str] = "CTA-BNC-88019482"
    liquidation_date: Optional[datetime] = None
    assessment: Optional[DamageAssessment] = None
    fraud_analysis: Optional[FraudAnalysis] = None
    payment: Optional[PaymentAuthorization] = None
