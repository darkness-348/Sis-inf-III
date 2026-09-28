from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database import Base
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, PolicyType, UserRole

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.ANALYST, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PolicyModel(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(50), unique=True, index=True, nullable=False)
    insured_name = Column(String(150), nullable=False)
    insured_document = Column(String(50), nullable=False)
    policy_type = Column(SQLEnum(PolicyType), nullable=False)
    coverage_amount = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    claims = relationship("ClaimModel", back_populates="policy")

class AdjusterModel(Base):
    __tablename__ = "adjusters"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    specialty = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    claims = relationship("ClaimModel", back_populates="adjuster")

class ClaimModel(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(50), unique=True, index=True, nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    policy_number = Column(String(50), nullable=False)
    incident_date = Column(Date, nullable=False)
    incident_description = Column(Text, nullable=False)
    incident_location = Column(String(200), nullable=False)
    claimed_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.RECEIVED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    adjuster_id = Column(Integer, ForeignKey("adjusters.id"), nullable=True)
    fraud_risk_level = Column(SQLEnum(FraudRiskLevel), default=FraudRiskLevel.LOW)
    authorized_payment_amount = Column(Float, nullable=True)

    policy = relationship("PolicyModel", back_populates="claims")
    adjuster = relationship("AdjusterModel", back_populates="claims")
    assessment = relationship("DamageAssessmentModel", back_populates="claim", uselist=False)
    fraud_analysis = relationship("FraudAnalysisModel", back_populates="claim", uselist=False)
    payment = relationship("PaymentAuthorizationModel", back_populates="claim", uselist=False)

class DamageAssessmentModel(Base):
    __tablename__ = "damage_assessments"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False, unique=True)
    adjuster_id = Column(Integer, ForeignKey("adjusters.id"), nullable=False)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    labor_cost = Column(Float, nullable=False)
    parts_cost = Column(Float, nullable=False)
    approved_by_adjuster = Column(Boolean, default=True)

    claim = relationship("ClaimModel", back_populates="assessment")

class FraudAnalysisModel(Base):
    __tablename__ = "fraud_analyses"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False, unique=True)
    total_score = Column(Integer, nullable=False)
    risk_level = Column(SQLEnum(FraudRiskLevel), nullable=False)
    triggered_rules = Column(Text, nullable=False)
    analysis_notes = Column(Text, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("ClaimModel", back_populates="fraud_analysis")

class PaymentAuthorizationModel(Base):
    __tablename__ = "payment_authorizations"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False, unique=True)
    authorized_amount = Column(Float, nullable=False)
    required_level = Column(SQLEnum(ApprovalLevel), nullable=False)
    authorized_by = Column(String(100), nullable=False)
    status = Column(String(50), default="AUTHORIZED")
    authorization_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    claim = relationship("ClaimModel", back_populates="payment")
