from datetime import datetime, date
from typing import List
from app.domain.entities import Claim, Policy, FraudAnalysis, FraudRuleResult
from app.domain.enums import FraudRiskLevel, ClaimStatus
from app.application.interfaces.repository_interfaces import IClaimRepository, IPolicyRepository

class FraudEngineUseCases:
    def __init__(self, claim_repo: IClaimRepository, policy_repo: IPolicyRepository):
        self.claim_repo = claim_repo
        self.policy_repo = policy_repo

    def evaluate_claim_fraud_risk(self, claim_id: int) -> FraudAnalysis:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise ValueError(f"Siniestro con ID {claim_id} no encontrado.")

        policy = self.policy_repo.get_by_number(claim.policy_number)

        rules_evaluated: List[FraudRuleResult] = []
        total_score = 0

        # Rule 1: Claim filed within 30 days of policy start date (+35 pts)
        if policy:
            days_since_start = (claim.incident_date - policy.start_date).days
            if 0 <= days_since_start <= 30:
                score = 35
                total_score += score
                rules_evaluated.append(FraudRuleResult(
                    rule_code="R01_EARLY_CLAIM",
                    rule_name="Siniestro temprano (< 30 días inicio póliza)",
                    score_impact=score,
                    is_triggered=True,
                    details=f"Ocurrió {days_since_start} días después de emitir la póliza."
                ))

        # Rule 2: Claimed amount exceeds 75% of policy coverage (+30 pts)
        if policy and policy.coverage_amount > 0:
            ratio = claim.claimed_amount / policy.coverage_amount
            if ratio >= 0.75:
                score = 30
                total_score += score
                rules_evaluated.append(FraudRuleResult(
                    rule_code="R02_HIGH_AMOUNT_RATIO",
                    rule_name="Monto reclamado elevado (>= 75% cobertura)",
                    score_impact=score,
                    is_triggered=True,
                    details=f"Representa el {int(ratio*100)}% de la cobertura total (${policy.coverage_amount:,.2f})."
                ))

        # Rule 3: Incident date on weekend or late night flag in description (+15 pts)
        is_weekend = claim.incident_date.weekday() in (5, 6)
        if is_weekend or "madrugada" in claim.incident_description.lower() or "sin testigos" in claim.incident_description.lower():
            score = 15
            total_score += score
            rules_evaluated.append(FraudRuleResult(
                rule_code="R03_CIRCUMSTANCE_RISK",
                rule_name="Circunstancias atípicas (Fin de semana / Sin testigos)",
                score_impact=score,
                is_triggered=True,
                details="Ocurrió en fin de semana o sin testigos presentes."
            ))

        # Rule 4: High claim amount (> $30,000 USD) (+20 pts)
        if claim.claimed_amount >= 30000:
            score = 20
            total_score += score
            rules_evaluated.append(FraudRuleResult(
                rule_code="R04_HIGH_VALUATION",
                rule_name="Valor cuantioso del siniestro (>= $30,000 USD)",
                score_impact=score,
                is_triggered=True,
                details=f"Monto reclamado: ${claim.claimed_amount:,.2f}."
            ))

        # Determine Risk Level
        if total_score >= 65:
            risk_level = FraudRiskLevel.CRITICAL
        elif total_score >= 40:
            risk_level = FraudRiskLevel.HIGH
        elif total_score >= 20:
            risk_level = FraudRiskLevel.MEDIUM
        else:
            risk_level = FraudRiskLevel.LOW

        triggered_rule_names = [r.rule_name for r in rules_evaluated if r.is_triggered]

        analysis = FraudAnalysis(
            id=None,
            claim_id=claim_id,
            total_score=total_score,
            risk_level=risk_level,
            triggered_rules=triggered_rule_names,
            analysis_notes=f"Evaluación realizada automáticamente. Puntaje total: {total_score}/100. Nivel de Riesgo: {risk_level.value}.",
            analyzed_at=datetime.now()
        )

        saved_analysis = self.claim_repo.save_fraud_analysis(analysis)

        # Update claim risk level and status if critical
        claim.fraud_risk_level = risk_level
        if risk_level in (FraudRiskLevel.HIGH, FraudRiskLevel.CRITICAL):
            claim.status = ClaimStatus.FRAUD_FLAGGED

        self.claim_repo.update(claim)
        return saved_analysis
