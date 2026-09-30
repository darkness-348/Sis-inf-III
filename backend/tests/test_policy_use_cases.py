import pytest
from datetime import date
from app.domain.entities import Policy
from app.domain.enums import PolicyStatus, PolicyType
from app.domain.exceptions import PolicyExpiredException, PolicyInactiveException, PolicyNotFoundException
from app.infrastructure.repositories import PolicyRepository
from app.application.use_cases.policy_use_cases import PolicyUseCases
from app.infrastructure.database import Base, engine, SessionLocal

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_verify_active_policy_success():
    db = SessionLocal()
    repo = PolicyRepository(db)
    
    # Save active policy
    policy = Policy(
        id=None,
        policy_number="POL-TEST-001",
        insured_name="Juan Perez",
        insured_document="1712345678",
        policy_type=PolicyType.AUTO,
        coverage_amount=30000.0,
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
        status=PolicyStatus.ACTIVE
    )
    repo.save(policy)
    
    use_cases = PolicyUseCases(repo)
    verified = use_cases.verify_policy_validity("POL-TEST-001", date(2026, 5, 10))
    assert verified.policy_number == "POL-TEST-001"
    assert verified.status == PolicyStatus.ACTIVE
    db.close()

def test_verify_expired_policy_raises_exception():
    db = SessionLocal()
    repo = PolicyRepository(db)
    
    policy = Policy(
        id=None,
        policy_number="POL-TEST-EXPIRED",
        insured_name="Maria Gomez",
        insured_document="0918273645",
        policy_type=PolicyType.HOME,
        coverage_amount=50000.0,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31),
        status=PolicyStatus.ACTIVE
    )
    repo.save(policy)
    
    use_cases = PolicyUseCases(repo)
    with pytest.raises(PolicyExpiredException):
        use_cases.verify_policy_validity("POL-TEST-EXPIRED", date(2026, 5, 10))
    db.close()
