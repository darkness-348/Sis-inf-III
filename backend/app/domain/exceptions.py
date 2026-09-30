class DomainException(Exception):
    """Base exception for domain layer violations."""
    pass

class PolicyNotFoundException(DomainException):
    def __init__(self, policy_number: str):
        super().__init__(f"La póliza con número '{policy_number}' no fue encontrada.")

class PolicyExpiredException(DomainException):
    def __init__(self, policy_number: str, expiration_date: str):
        super().__init__(f"La póliza '{policy_number}' se encuentra vencida desde {expiration_date}.")

class PolicyInactiveException(DomainException):
    def __init__(self, policy_number: str, status: str):
        super().__init__(f"La póliza '{policy_number}' no está activa. Estado actual: {status}.")

class ClaimNotFoundException(DomainException):
    def __init__(self, claim_id: int):
        super().__init__(f"El siniestro con ID '{claim_id}' no existe.")

class InvalidIncidentDateException(DomainException):
    def __init__(self, message: str):
        super().__init__(message)


class AdjusterNotFoundException(DomainException):
    def __init__(self, adjuster_id: int):
        super().__init__(f"El perito con ID '{adjuster_id}' no fue encontrado.")

class InvalidApprovalException(DomainException):
    def __init__(self, message: str):
        super().__init__(message)

class UserAlreadyExistsException(DomainException):
    def __init__(self, username_or_email: str):
        super().__init__(f"El usuario o correo electrónico '{username_or_email}' ya se encuentra registrado.")

class InvalidCredentialsException(DomainException):
    def __init__(self):
        super().__init__("Nombre de usuario o contraseña incorrectos.")

class UnauthorizedException(DomainException):
    def __init__(self, detail: str = "No autorizado. Token de acceso inválido o expirado."):
        super().__init__(detail)
