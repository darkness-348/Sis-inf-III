from datetime import datetime
from typing import Tuple
from app.domain.entities import PaymentAuthorization, Claim
from app.domain.enums import ApprovalLevel, ClaimStatus, FraudRiskLevel
from app.domain.exceptions import ClaimNotFoundException, InvalidApprovalException
from app.infrastructure.repositories import ClaimRepository

class PaymentUseCases:
    def __init__(self, claim_repo: ClaimRepository):
        self.claim_repo = claim_repo

    def calculate_required_approval_level(self, amount: float) -> Tuple[ApprovalLevel, str]:
        if amount <= 5000:
            return (ApprovalLevel.JUNIOR_ANALYST, "Analista Junior de Siniestros (Límite $5,000 USD)")
        elif amount <= 25000:
            return (ApprovalLevel.SENIOR_SUPERVISOR, "Supervisor Senior de Liquidación (Límite $25,000 USD)")
        else:
            return (ApprovalLevel.EXECUTIVE_DIRECTOR, "Director Ejecutivo de Siniestros (Límite > $25,000 USD)")

    def authorize_payment(self, claim_id: int, authorized_by: str, notes: str = None) -> PaymentAuthorization:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ClaimNotFoundException(claim_id)

        if claim.status == ClaimStatus.FRAUD_FLAGGED:
            raise InvalidApprovalException("No se puede autorizar el pago de un siniestro marcado con sospecha de FRAUDE sin auditoría previa.")

        amount_to_pay = claim.assessment.estimated_cost if claim.assessment else claim.claimed_amount

        req_level, req_desc = self.calculate_required_approval_level(amount_to_pay)

        payment = PaymentAuthorization(
            id=None,
            claim_id=claim_id,
            authorized_amount=amount_to_pay,
            required_level=req_level,
            authorized_by=authorized_by,
            status="AUTHORIZED",
            authorization_date=datetime.now(),
            notes=notes or f"Pago autorizado según nivel de jerarquía: {req_desc}"
        )

        saved_payment = self.claim_repo.save_payment_authorization(payment)

        claim.status = ClaimStatus.APPROVED
        claim.authorized_payment_amount = amount_to_pay
        self.claim_repo.update(claim)

        return saved_payment

    def liquidate_claim(self, claim_id: int, user_officer: str, bank_account_number: str = None) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ClaimNotFoundException(claim_id)

        if claim.status != ClaimStatus.APPROVED:
            raise InvalidApprovalException("El siniestro debe estar en estado APROBADO antes de efectuar la liquidación final.")

        now_dt = datetime.now()
        claim.status = ClaimStatus.LIQUIDATED
        claim.liquidation_date = now_dt
        if bank_account_number and bank_account_number.strip():
            claim.bank_account_number = bank_account_number.strip()
        elif not claim.bank_account_number:
            claim.bank_account_number = "CTA-BNC-88019482"

        amount_val = claim.authorized_payment_amount or (claim.assessment.estimated_cost if claim.assessment else claim.claimed_amount)
        formatted_amount = f"${amount_val:,.2f} USD"
        date_str = now_dt.strftime("%d/%m/%Y %H:%M")
        receipt_msg = f"Cancelado la cantidad de {formatted_amount} al número de cuenta {claim.bank_account_number} y la fecha de liquidación {date_str}."

        if claim.payment:
            claim.payment.status = "PAID"
            claim.payment.notes = receipt_msg

        return self.claim_repo.update(claim)
