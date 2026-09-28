import type { ClaimStatus, FraudRiskLevel, PolicyStatus, PolicyType } from '../types/claims';
import type { UserRole } from '../types/auth';

/**
 * Spanish translation dictionary for Claim Statuses
 */
export const getClaimStatusLabel = (status: ClaimStatus | string): string => {
  switch (status) {
    case 'RECEIVED':
      return 'Recibido / Ingresado';
    case 'VERIFYING':
      return 'Verificando Póliza';
    case 'ASSIGNED_TO_ADJUSTER':
      return 'Perito Asignado';
    case 'UNDER_EVALUATION':
      return 'En Evaluación Técnica';
    case 'FRAUD_FLAGGED':
      return 'Alerta Anti-Fraude';
    case 'PENDING_APPROVAL':
      return 'Pendiente de Aprobación';
    case 'APPROVED':
      return 'Aprobado para Pago';
    case 'REJECTED':
      return 'Siniestro Rechazado';
    case 'LIQUIDATED':
      return 'Liquidado / Pagado';
    default:
      return status || 'Desconocido';
  }
};

/**
 * Returns CSS badge class for claim status
 */
export const getClaimStatusBadgeClass = (status: ClaimStatus | string): string => {
  switch (status) {
    case 'RECEIVED':
      return 'badge-received';
    case 'ASSIGNED_TO_ADJUSTER':
      return 'badge-assigned';
    case 'UNDER_EVALUATION':
      return 'badge-evaluation';
    case 'FRAUD_FLAGGED':
      return 'badge-fraud';
    case 'PENDING_APPROVAL':
      return 'badge-pending';
    case 'APPROVED':
      return 'badge-approved';
    case 'LIQUIDATED':
      return 'badge-liquidated';
    case 'REJECTED':
      return 'badge-fraud';
    default:
      return 'badge-received';
  }
};

/**
 * Spanish translation for Fraud Risk Levels
 */
export const getFraudRiskLabel = (level: FraudRiskLevel | string): string => {
  switch (level) {
    case 'LOW':
      return 'Riesgo Bajo';
    case 'MEDIUM':
      return 'Riesgo Medio';
    case 'HIGH':
      return 'Riesgo Alto';
    case 'CRITICAL':
      return 'Riesgo Crítico';
    default:
      return level || 'Sin Evaluar';
  }
};

/**
 * Spanish translation for Policy Statuses
 */
export const getPolicyStatusLabel = (status: PolicyStatus | string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Activa / Vigente';
    case 'EXPIRED':
      return 'Vencida / Expirada';
    case 'SUSPENDED':
      return 'Suspendida';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status || 'Desconocida';
  }
};

/**
 * Spanish translation for Policy Types
 */
export const getPolicyTypeLabel = (type: PolicyType | string): string => {
  switch (type) {
    case 'AUTO':
      return 'Vehicular / Automotor';
    case 'HOME':
      return 'Hogar / Inmueble';
    case 'COMMERCIAL':
      return 'Comercial / Empresa';
    case 'HEALTH':
      return 'Salud / Médicos';
    default:
      return type || 'General';
  }
};

/**
 * Spanish translation for User Roles
 */
export const getUserRoleLabel = (role: UserRole | string): string => {
  switch (role) {
    case 'ANALYST':
      return 'Analista de Liquidación';
    case 'SUPERVISOR':
      return 'Supervisor Senior';
    case 'DIRECTOR':
      return 'Director Ejecutivo';
    case 'ADMIN':
      return 'Administrador de Sistema';
    case 'CLIENT':
      return 'Cliente / Asegurado';
    default:
      return role || 'Usuario';
  }
};

/**
 * Format currency in USD with Spanish format ($ XX,XXX.XX USD)
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '$0.00 USD';
  return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
};
