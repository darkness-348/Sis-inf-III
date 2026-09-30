from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
import json

from app.domain.entities import Policy, Claim, Adjuster, DamageAssessment, FraudAnalysis, PaymentAuthorization, User
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, UserRole
from app.application.interfaces.repository_interfaces import IPolicyRepository, IAdjusterRepository, IClaimRepository, IUserRepository
from app.infrastructure.models import (
    PolicyModel, ClaimModel, AdjusterModel, DamageAssessmentModel, 
    FraudAnalysisModel, PaymentAuthorizationModel, UserModel
)

class UserRepository(IUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            email=model.email,
            hashed_password=model.hashed_password,
            full_name=model.full_name,
            role=model.role,
            is_active=model.is_active,
            created_at=model.created_at
        )

    def get_by_username(self, username: str) -> Optional[User]:
        model = self.db.query(UserModel).filter(UserModel.username == username).first()
        return self._to_entity(model) if model else None

    def get_by_email(self, email: str) -> Optional[User]:
        model = self.db.query(UserModel).filter(UserModel.email == email).first()
        return self._to_entity(model) if model else None

    def get_by_id(self, user_id: int) -> Optional[User]:
        model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        return self._to_entity(model) if model else None

    def save(self, user: User) -> User:
        model = UserModel(
            username=user.username,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at or datetime.now()
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        user.id = model.id
        return user


class PolicyRepository(IPolicyRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_number(self, policy_number: str) -> Optional[Policy]:
        model = self.db.query(PolicyModel).filter(PolicyModel.policy_number == policy_number).first()
        if not model:
            return None
        return Policy(
            id=model.id,
            policy_number=model.policy_number,
            insured_name=model.insured_name,
            insured_document=model.insured_document,
            policy_type=model.policy_type,
            coverage_amount=model.coverage_amount,
            start_date=model.start_date,
            end_date=model.end_date,
            status=model.status,
            bank_account_number=model.bank_account_number,
            created_at=model.created_at
        )

    def get_all(self) -> List[Policy]:
        models = self.db.query(PolicyModel).all()
        return [
            Policy(
                id=m.id,
                policy_number=m.policy_number,
                insured_name=m.insured_name,
                insured_document=m.insured_document,
                policy_type=m.policy_type,
                coverage_amount=m.coverage_amount,
                start_date=m.start_date,
                end_date=m.end_date,
                status=m.status,
                bank_account_number=m.bank_account_number,
                created_at=m.created_at
            ) for m in models
        ]

    def save(self, policy: Policy) -> Policy:
        model = PolicyModel(
            policy_number=policy.policy_number,
            insured_name=policy.insured_name,
            insured_document=policy.insured_document,
            policy_type=policy.policy_type,
            coverage_amount=policy.coverage_amount,
            start_date=policy.start_date,
            end_date=policy.end_date,
            status=policy.status,
            bank_account_number=policy.bank_account_number
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        policy.id = model.id
        return policy


class AdjusterRepository(IAdjusterRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, adjuster_id: int) -> Optional[Adjuster]:
        model = self.db.query(AdjusterModel).filter(AdjusterModel.id == adjuster_id).first()
        if not model:
            return None
        claims_count = self.db.query(ClaimModel).filter(
            ClaimModel.adjuster_id == adjuster_id, 
            ClaimModel.status.in_([ClaimStatus.ASSIGNED_TO_ADJUSTER, ClaimStatus.UNDER_EVALUATION])
        ).count()
        return Adjuster(
            id=model.id,
            full_name=model.full_name,
            specialty=model.specialty,
            phone=model.phone,
            email=model.email,
            is_active=model.is_active,
            active_claims_count=claims_count
        )

    def get_all(self) -> List[Adjuster]:
        models = self.db.query(AdjusterModel).filter(AdjusterModel.is_active == True).all()
        result = []
        for m in models:
            cnt = self.db.query(ClaimModel).filter(
                ClaimModel.adjuster_id == m.id, 
                ClaimModel.status.in_([ClaimStatus.ASSIGNED_TO_ADJUSTER, ClaimStatus.UNDER_EVALUATION])
            ).count()
            result.append(Adjuster(
                id=m.id,
                full_name=m.full_name,
                specialty=m.specialty,
                phone=m.phone,
                email=m.email,
                is_active=m.is_active,
                active_claims_count=cnt
            ))
        return result


class ClaimRepository(IClaimRepository):
    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, model: ClaimModel) -> Claim:
        assessment = None
        if model.assessment:
            assessment = DamageAssessment(
                id=model.assessment.id,
                claim_id=model.assessment.claim_id,
                adjuster_id=model.assessment.adjuster_id,
                assessment_date=model.assessment.assessment_date,
                description=model.assessment.description,
                estimated_cost=model.assessment.estimated_cost,
                labor_cost=model.assessment.labor_cost,
                parts_cost=model.assessment.parts_cost,
                approved_by_adjuster=model.assessment.approved_by_adjuster
            )

        fraud_analysis = None
        if model.fraud_analysis:
            rules = json.loads(model.fraud_analysis.triggered_rules) if model.fraud_analysis.triggered_rules else []
            fraud_analysis = FraudAnalysis(
                id=model.fraud_analysis.id,
                claim_id=model.fraud_analysis.claim_id,
                total_score=model.fraud_analysis.total_score,
                risk_level=model.fraud_analysis.risk_level,
                triggered_rules=rules,
                analysis_notes=model.fraud_analysis.analysis_notes,
                analyzed_at=model.fraud_analysis.analyzed_at
            )

        payment = None
        if model.payment:
            payment = PaymentAuthorization(
                id=model.payment.id,
                claim_id=model.payment.claim_id,
                authorized_amount=model.payment.authorized_amount,
                required_level=model.payment.required_level,
                authorized_by=model.payment.authorized_by,
                status=model.payment.status,
                authorization_date=model.payment.authorization_date,
                notes=model.payment.notes
            )

        return Claim(
            id=model.id,
            claim_number=model.claim_number,
            policy_number=model.policy_number,
            policy_id=model.policy_id,
            incident_date=model.incident_date,
            incident_description=model.incident_description,
            incident_location=model.incident_location,
            claimed_amount=model.claimed_amount,
            status=model.status,
            created_at=model.created_at,
            adjuster_id=model.adjuster_id,
            fraud_risk_level=model.fraud_risk_level,
            authorized_payment_amount=model.authorized_payment_amount,
            bank_account_number=model.bank_account_number,
            liquidation_date=model.liquidation_date,
            assessment=assessment,
            fraud_analysis=fraud_analysis,
            payment=payment
        )

    def save(self, claim: Claim) -> Claim:
        model = ClaimModel(
            claim_number=claim.claim_number,
            policy_id=claim.policy_id,
            policy_number=claim.policy_number,
            incident_date=claim.incident_date,
            incident_description=claim.incident_description,
            incident_location=claim.incident_location,
            claimed_amount=claim.claimed_amount,
            status=claim.status,
            created_at=claim.created_at or datetime.now(),
            adjuster_id=claim.adjuster_id,
            fraud_risk_level=claim.fraud_risk_level,
            authorized_payment_amount=claim.authorized_payment_amount,
            bank_account_number=claim.bank_account_number,
            liquidation_date=claim.liquidation_date
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        claim.id = model.id
        return claim

    def update(self, claim: Claim) -> Claim:
        model = self.db.query(ClaimModel).filter(ClaimModel.id == claim.id).first()
        if model:
            model.status = claim.status
            model.adjuster_id = claim.adjuster_id
            model.fraud_risk_level = claim.fraud_risk_level
            model.authorized_payment_amount = claim.authorized_payment_amount
            model.bank_account_number = claim.bank_account_number
            model.liquidation_date = claim.liquidation_date
            if claim.payment and model.payment:
                model.payment.status = claim.payment.status
                model.payment.notes = claim.payment.notes
            self.db.commit()
            self.db.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, claim_id: int) -> Optional[Claim]:
        model = self.db.query(ClaimModel).options(
            joinedload(ClaimModel.assessment),
            joinedload(ClaimModel.fraud_analysis),
            joinedload(ClaimModel.payment)
        ).filter(ClaimModel.id == claim_id).first()
        if not model:
            return None
        return self._to_entity(model)

    def get_all(self) -> List[Claim]:
        models = self.db.query(ClaimModel).options(
            joinedload(ClaimModel.assessment),
            joinedload(ClaimModel.fraud_analysis),
            joinedload(ClaimModel.payment)
        ).order_by(ClaimModel.id.desc()).all()
        return [self._to_entity(m) for m in models]

    def save_assessment(self, assessment: DamageAssessment) -> DamageAssessment:
        model = DamageAssessmentModel(
            claim_id=assessment.claim_id,
            adjuster_id=assessment.adjuster_id,
            assessment_date=assessment.assessment_date or datetime.now(),
            description=assessment.description,
            estimated_cost=assessment.estimated_cost,
            labor_cost=assessment.labor_cost,
            parts_cost=assessment.parts_cost,
            approved_by_adjuster=assessment.approved_by_adjuster
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        assessment.id = model.id
        return assessment

    def save_fraud_analysis(self, fraud: FraudAnalysis) -> FraudAnalysis:
        model = FraudAnalysisModel(
            claim_id=fraud.claim_id,
            total_score=fraud.total_score,
            risk_level=fraud.risk_level,
            triggered_rules=json.dumps(fraud.triggered_rules),
            analysis_notes=fraud.analysis_notes,
            analyzed_at=fraud.analyzed_at or datetime.now()
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        fraud.id = model.id
        return fraud

    def save_payment_authorization(self, payment: PaymentAuthorization) -> PaymentAuthorization:
        model = PaymentAuthorizationModel(
            claim_id=payment.claim_id,
            authorized_amount=payment.authorized_amount,
            required_level=payment.required_level,
            authorized_by=payment.authorized_by,
            status=payment.status,
            authorization_date=payment.authorization_date or datetime.now(),
            notes=payment.notes
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        payment.id = model.id
        return payment
