from typing import List, Optional
from datetime import date, datetime
from app.domain.entities import Claim, DamageAssessment
from app.domain.enums import ClaimStatus, FraudRiskLevel
from app.domain.exceptions import ClaimNotFoundException, AdjusterNotFoundException
from app.application.interfaces.repository_interfaces import IClaimRepository, IPolicyRepository, IAdjusterRepository
from app.application.use_cases.policy_use_cases import PolicyUseCases
from app.application.use_cases.fraud_use_cases import FraudEngineUseCases

class ClaimUseCases:
    def __init__(self, claim_repo: IClaimRepository, policy_repo: IPolicyRepository, adjuster_repo: IAdjusterRepository):
        self.claim_repo = claim_repo
        self.policy_repo = policy_repo
        self.adjuster_repo = adjuster_repo
        self.policy_use_cases = PolicyUseCases(policy_repo)
        self.fraud_engine = FraudEngineUseCases(claim_repo, policy_repo)

    def register_claim(
        self,
        policy_number: str,
        incident_date: date,
        incident_description: str,
        incident_location: str,
        claimed_amount: float
    ) -> Claim:
        # Step 1: Verify policy existence and active status
        policy = self.policy_use_cases.verify_policy_validity(policy_number, incident_date)

        # Generate claim number
        claim_count = len(self.claim_repo.get_all()) + 1
        claim_number = f"SIN-{datetime.now().year}-{claim_count:04d}"

        # Create claim instance
        claim = Claim(
            id=None,
            claim_number=claim_number,
            policy_number=policy.policy_number,
            policy_id=policy.id,
            incident_date=incident_date,
            incident_description=incident_description,
            incident_location=incident_location,
            claimed_amount=claimed_amount,
            status=ClaimStatus.RECEIVED,
            created_at=datetime.now()
        )

        saved_claim = self.claim_repo.save(claim)

        # Step 2: Run automated fraud detection check
        self.fraud_engine.evaluate_claim_fraud_risk(saved_claim.id)

        return self.claim_repo.get_by_id(saved_claim.id)

    def assign_adjuster(self, claim_id: int, adjuster_id: int) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ClaimNotFoundException(claim_id)

        adjuster = self.adjuster_repo.get_by_id(adjuster_id)
        if not adjuster:
            raise AdjusterNotFoundException(adjuster_id)

        claim.adjuster_id = adjuster.id
        claim.status = ClaimStatus.ASSIGNED_TO_ADJUSTER
        return self.claim_repo.update(claim)

    def record_damage_assessment(
        self,
        claim_id: int,
        adjuster_id: int,
        description: str,
        estimated_cost: float,
        labor_cost: float,
        parts_cost: float
    ) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ClaimNotFoundException(claim_id)

        assessment = DamageAssessment(
            id=None,
            claim_id=claim_id,
            adjuster_id=adjuster_id,
            assessment_date=datetime.now(),
            description=description,
            estimated_cost=estimated_cost,
            labor_cost=labor_cost,
            parts_cost=parts_cost,
            approved_by_adjuster=True
        )

        self.claim_repo.save_assessment(assessment)

        # Update claim status
        if claim.status != ClaimStatus.FRAUD_FLAGGED:
            claim.status = ClaimStatus.PENDING_APPROVAL
        else:
            claim.status = ClaimStatus.UNDER_EVALUATION

        return self.claim_repo.update(claim)

    def get_all_claims(self) -> List[Claim]:
        return self.claim_repo.get_all()

    def get_claim_by_id(self, claim_id: int) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ClaimNotFoundException(claim_id)
        return claim
