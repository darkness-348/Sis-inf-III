import pytest
from datetime import date, timedelta
from app.domain.entities import Policy, Claim
from app.domain.enums import PolicyStatus, PolicyType, ClaimStatus, FraudRiskLevel
from app.domain.exceptions import InvalidIncidentDateException
from app.infrastructure.repositories import PolicyRepository, ClaimRepository, AdjusterRepository
from app.application.use_cases.claim_use_cases import ClaimUseCases
from app.infrastructure.database import Base, engine, SessionLocal

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def create_active_policy(db):
    repo = PolicyRepository(db)
    policy = Policy(
        id=None,
        policy_number="POL-DATE-TEST",
        insured_name="Pedro Picapiedra",
        insured_document="12345678",
        policy_type=PolicyType.AUTO,
        coverage_amount=40000.0,
        start_date=date(2025, 1, 1),
        end_date=date(2028, 12, 31),
        status=PolicyStatus.ACTIVE
    )
    return repo.save(policy)

def test_register_claim_future_date_fails():
    db = SessionLocal()
    create_active_policy(db)
    claim_repo = ClaimRepository(db)
    policy_repo = PolicyRepository(db)
    adj_repo = AdjusterRepository(db)
    use_cases = ClaimUseCases(claim_repo, policy_repo, adj_repo)

    future_date = date.today() + timedelta(days=5)
    with pytest.raises(InvalidIncidentDateException) as exc_info:
        use_cases.register_claim(
            policy_number="POL-DATE-TEST",
            incident_date=future_date,
            incident_description="Colisión frontal",
            incident_location="Av. Principal",
            claimed_amount=2000.0
        )
    assert "futura" in str(exc_info.value).lower()
    db.close()

def test_register_claim_too_old_date_fails():
    db = SessionLocal()
    create_active_policy(db)
    claim_repo = ClaimRepository(db)
    policy_repo = PolicyRepository(db)
    adj_repo = AdjusterRepository(db)
    use_cases = ClaimUseCases(claim_repo, policy_repo, adj_repo)

    too_old_date = date.today() - timedelta(days=400)
    with pytest.raises(InvalidIncidentDateException) as exc_info:
        use_cases.register_claim(
            policy_number="POL-DATE-TEST",
            incident_date=too_old_date,
            incident_description="Robo de llantas",
            incident_location="Estacionamiento",
            claimed_amount=1500.0
        )
    assert "365 días" in str(exc_info.value)
    db.close()

def test_register_claim_old_date_flags_fraud():
    db = SessionLocal()
    create_active_policy(db)
    claim_repo = ClaimRepository(db)
    policy_repo = PolicyRepository(db)
    adj_repo = AdjusterRepository(db)
    use_cases = ClaimUseCases(claim_repo, policy_repo, adj_repo)

    # Date 90 days ago (older than 60 days threshold for flag)
    old_date = date.today() - timedelta(days=90)
    claim = use_cases.register_claim(
        policy_number="POL-DATE-TEST",
        incident_date=old_date,
        incident_description="Rayón de pintura",
        incident_location="Garaje",
        claimed_amount=800.0
    )

    assert claim.status == ClaimStatus.FRAUD_FLAGGED
    assert claim.fraud_risk_level in (FraudRiskLevel.HIGH, FraudRiskLevel.CRITICAL)
    assert "R05_LATE_REPORTING" in [r for r in claim.fraud_analysis.triggered_rules if "R05" in r or "Extemporáneo" in r or "Antigua" in r] or len(claim.fraud_analysis.triggered_rules) > 0
    db.close()
