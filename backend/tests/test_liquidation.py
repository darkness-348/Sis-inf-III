from datetime import date, datetime
import pytest
from app.infrastructure.database import SessionLocal, Base, engine
from app.infrastructure.models import PolicyModel, ClaimModel, PaymentAuthorizationModel, UserModel
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, PolicyType, UserRole
from app.infrastructure.repositories import ClaimRepository, PolicyRepository
from app.application.use_cases.payment_use_cases import PaymentUseCases

@pytest.fixture(autouse=True)
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        p = PolicyModel(
            policy_number="POL-LIQ-001",
            insured_name="Test User",
            insured_document="1234567890",
            policy_type=PolicyType.AUTO,
            coverage_amount=20000.0,
            start_date=date(2026, 1, 1),
            end_date=date(2027, 1, 1),
            status=PolicyStatus.ACTIVE,
            bank_account_number="CTA-TEST-998877"
        )
        db.add(p)
        db.commit()

        c = ClaimModel(
            claim_number="SIN-TEST-001",
            policy_id=p.id,
            policy_number=p.policy_number,
            incident_date=date(2026, 8, 10),
            incident_description="Test collision",
            incident_location="Main St",
            claimed_amount=3000.0,
            status=ClaimStatus.APPROVED,
            authorized_payment_amount=2800.0,
            bank_account_number="CTA-TEST-998877"
        )
        db.add(c)
        db.commit()

        pay = PaymentAuthorizationModel(
            claim_id=c.id,
            authorized_amount=2800.0,
            required_level=ApprovalLevel.JUNIOR_ANALYST,
            authorized_by="Supervisor Test",
            status="AUTHORIZED",
            authorization_date=datetime.now()
        )
        db.add(pay)
        db.commit()

        yield db
    finally:
        db.close()

def test_liquidate_claim_with_account_and_date(db_session):
    claim_repo = ClaimRepository(db_session)
    payment_cases = PaymentUseCases(claim_repo)

    claim = claim_repo.get_by_id(1)
    assert claim.status == ClaimStatus.APPROVED

    liquidated_claim = payment_cases.liquidate_claim(
        claim_id=1,
        user_officer="Supervisor Test",
        bank_account_number="CTA-CUSTOM-112233"
    )

    assert liquidated_claim.status == ClaimStatus.LIQUIDATED
    assert liquidated_claim.bank_account_number == "CTA-CUSTOM-112233"
    assert liquidated_claim.liquidation_date is not None
    assert liquidated_claim.payment.status == "PAID"
    assert "Cancelado la cantidad de $2,800.00 USD al número de cuenta CTA-CUSTOM-112233 y la fecha de liquidación" in liquidated_claim.payment.notes
