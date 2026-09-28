import pytest
from datetime import date
from app.domain.entities import Policy, Claim
from app.domain.enums import PolicyStatus, PolicyType, ClaimStatus, FraudRiskLevel, ApprovalLevel
from app.domain.exceptions import InvalidApprovalException
from app.infrastructure.repositories import PolicyRepository, ClaimRepository, AdjusterRepository
from app.application.use_cases.claim_use_cases import ClaimUseCases
from app.application.use_cases.payment_use_cases import PaymentUseCases
from app.application.use_cases.fraud_use_cases import FraudEngineUseCases
from app.infrastructure.database import Base, engine, SessionLocal

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_fraud_engine_flags_critical_risk():
    db = SessionLocal()
    policy_repo = PolicyRepository(db)
    claim_repo = ClaimRepository(db)
    
    # Save active policy starting Jan 15, 2026
    p = policy_repo.save(Policy(
        id=None,
        policy_number="POL-FRAUD-01",
        insured_name="Pedro Picapiedra",
        insured_document="1700000000",
        policy_type=PolicyType.AUTO,
        coverage_amount=40000.0,
        start_date=date(2026, 1, 15),
        end_date=date(2027, 1, 15),
        status=PolicyStatus.ACTIVE
    ))

    # Save claim reported on Jan 20 (5 days after policy start -> Early claim flag!)
    # Claimed amount 35000 / 40000 = 87.5% ratio -> High amount ratio flag!
    claim = claim_repo.save(Claim(
        id=None,
        claim_number="SIN-TEST-99",
        policy_number=p.policy_number,
        policy_id=p.id,
        incident_date=date(2026, 1, 20),
        incident_description="Accidente en la madrugada sin testigos",
        incident_location="Carretera Desierta",
        claimed_amount=35000.0,
        status=ClaimStatus.RECEIVED,
        created_at=None
    ))

    fraud_engine = FraudEngineUseCases(claim_repo, policy_repo)
    analysis = fraud_engine.evaluate_claim_fraud_risk(claim.id)

    assert analysis.risk_level in (FraudRiskLevel.HIGH, FraudRiskLevel.CRITICAL)
    assert analysis.total_score >= 60
    assert len(analysis.triggered_rules) >= 2
    
    # Verify claim status updated to FRAUD_FLAGGED
    updated_claim = claim_repo.get_by_id(claim.id)
    assert updated_claim.status == ClaimStatus.FRAUD_FLAGGED
    db.close()

def test_payment_authorization_hierarchy():
    db = SessionLocal()
    claim_repo = ClaimRepository(db)
    payment_use_cases = PaymentUseCases(claim_repo)

    # Test levels
    lvl1, desc1 = payment_use_cases.calculate_required_approval_level(3500.0)
    assert lvl1 == ApprovalLevel.JUNIOR_ANALYST

    lvl2, desc2 = payment_use_cases.calculate_required_approval_level(18000.0)
    assert lvl2 == ApprovalLevel.SENIOR_SUPERVISOR

    lvl3, desc3 = payment_use_cases.calculate_required_approval_level(45000.0)
    assert lvl3 == ApprovalLevel.EXECUTIVE_DIRECTOR
    db.close()

def test_payment_authorization_fails_if_fraud_flagged():
    db = SessionLocal()
    policy_repo = PolicyRepository(db)
    claim_repo = ClaimRepository(db)
    payment_use_cases = PaymentUseCases(claim_repo)

    p = policy_repo.save(Policy(
        id=None,
        policy_number="POL-ANY",
        insured_name="Pedro Picapiedra",
        insured_document="1700000000",
        policy_type=PolicyType.AUTO,
        coverage_amount=40000.0,
        start_date=date(2026, 1, 15),
        end_date=date(2027, 1, 15),
        status=PolicyStatus.ACTIVE
    ))

    # Save claim with FRAUD_FLAGGED status
    claim = claim_repo.save(Claim(
        id=None,
        claim_number="SIN-FRAUD-BLOCKED",
        policy_number=p.policy_number,
        policy_id=p.id,
        incident_date=date(2026, 2, 1),
        incident_description="Detalles sospexosos",
        incident_location="Lugar X",
        claimed_amount=12000.0,
        status=ClaimStatus.FRAUD_FLAGGED,
        created_at=None
    ))

    with pytest.raises(InvalidApprovalException):
        payment_use_cases.authorize_payment(claim.id, authorized_by="Analista Test")
    db.close()
