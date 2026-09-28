from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities import Policy, Claim, Adjuster, DamageAssessment, FraudAnalysis, PaymentAuthorization, User

class IUserRepository(ABC):
    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def save(self, user: User) -> User:
        pass


class IPolicyRepository(ABC):
    @abstractmethod
    def get_by_number(self, policy_number: str) -> Optional[Policy]:
        pass

    @abstractmethod
    def get_all(self) -> List[Policy]:
        pass

    @abstractmethod
    def save(self, policy: Policy) -> Policy:
        pass


class IAdjusterRepository(ABC):
    @abstractmethod
    def get_by_id(self, adjuster_id: int) -> Optional[Adjuster]:
        pass

    @abstractmethod
    def get_all(self) -> List[Adjuster]:
        pass


class IClaimRepository(ABC):
    @abstractmethod
    def save(self, claim: Claim) -> Claim:
        pass

    @abstractmethod
    def update(self, claim: Claim) -> Claim:
        pass

    @abstractmethod
    def get_by_id(self, claim_id: int) -> Optional[Claim]:
        pass

    @abstractmethod
    def get_all(self) -> List[Claim]:
        pass

    @abstractmethod
    def save_assessment(self, assessment: DamageAssessment) -> DamageAssessment:
        pass

    @abstractmethod
    def save_fraud_analysis(self, fraud: FraudAnalysis) -> FraudAnalysis:
        pass

    @abstractmethod
    def save_payment_authorization(self, payment: PaymentAuthorization) -> PaymentAuthorization:
        pass
