from typing import List, Optional
from datetime import date
from app.domain.entities import Policy
from app.domain.enums import PolicyStatus
from app.domain.exceptions import PolicyNotFoundException, PolicyExpiredException, PolicyInactiveException
from app.application.interfaces.repository_interfaces import IPolicyRepository

class PolicyUseCases:
    def __init__(self, policy_repo: IPolicyRepository):
        self.policy_repo = policy_repo

    def get_all_policies(self) -> List[Policy]:
        return self.policy_repo.get_all()

    def get_policy(self, policy_number: str) -> Policy:
        policy = self.policy_repo.get_by_number(policy_number)
        if not policy:
            raise PolicyNotFoundException(policy_number)
        return policy

    def verify_policy_validity(self, policy_number: str, incident_date: date) -> Policy:
        policy = self.get_policy(policy_number)

        if policy.status != PolicyStatus.ACTIVE:
            raise PolicyInactiveException(policy_number, policy.status.value)

        if incident_date < policy.start_date or incident_date > policy.end_date:
            raise PolicyExpiredException(policy_number, str(policy.end_date))

        return policy

    def register_policy(
        self,
        insured_name: str,
        insured_document: str,
        policy_type: str,
        coverage_amount: float,
        start_date: date,
        end_date: date,
        status: PolicyStatus = PolicyStatus.ACTIVE,
        bank_account_number: Optional[str] = "CTA-BNC-88019482",
        policy_number: Optional[str] = None
    ) -> Policy:
        if not policy_number or not policy_number.strip():
            count = len(self.policy_repo.get_all()) + 1
            policy_number = f"POL-{start_date.year}-{8800 + count}"

        policy = Policy(
            id=None,
            policy_number=policy_number.strip(),
            insured_name=insured_name.strip(),
            insured_document=insured_document.strip(),
            policy_type=policy_type,
            coverage_amount=coverage_amount,
            start_date=start_date,
            end_date=end_date,
            status=status,
            bank_account_number=bank_account_number.strip() if bank_account_number else "CTA-BNC-88019482"
        )
        return self.policy_repo.save(policy)
