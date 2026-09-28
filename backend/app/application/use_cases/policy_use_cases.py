from typing import List
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
