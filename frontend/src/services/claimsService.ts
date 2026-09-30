import api from './api';
import type { 
  Claim, Policy, Adjuster, DashboardMetrics, ClaimCreatePayload, 
  FraudAnalysis, PaymentAuthorization 
} from '../types/claims';

export const claimsService = {
  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    const res = await api.get<Policy[]>('/policies');
    return res.data;
  },

  getPolicyByNumber: async (policyNumber: string): Promise<Policy> => {
    const res = await api.get<Policy>(`/policies/${policyNumber}`);
    return res.data;
  },

  // Adjusters
  getAdjusters: async (): Promise<Adjuster[]> => {
    const res = await api.get<Adjuster[]>('/adjusters');
    return res.data;
  },

  // Claims
  getClaims: async (): Promise<Claim[]> => {
    const res = await api.get<Claim[]>('/claims');
    return res.data;
  },

  getClaimById: async (claimId: number): Promise<Claim> => {
    const res = await api.get<Claim>(`/claims/${claimId}`);
    return res.data;
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get<DashboardMetrics>('/claims/metrics');
    return res.data;
  },

  registerClaim: async (payload: ClaimCreatePayload): Promise<Claim> => {
    const res = await api.post<Claim>('/claims', payload);
    return res.data;
  },

  assignAdjuster: async (claimId: number, adjusterId: number): Promise<Claim> => {
    const res = await api.post<Claim>(`/claims/${claimId}/assign-adjuster`, { adjuster_id: adjusterId });
    return res.data;
  },

  recordAssessment: async (
    claimId: number,
    assessmentData: {
      adjuster_id: number;
      description: string;
      estimated_cost: number;
      labor_cost: number;
      parts_cost: number;
    }
  ): Promise<Claim> => {
    const res = await api.post<Claim>(`/claims/${claimId}/assessment`, assessmentData);
    return res.data;
  },

  evaluateFraud: async (claimId: number): Promise<FraudAnalysis> => {
    const res = await api.post<FraudAnalysis>(`/claims/${claimId}/evaluate-fraud`);
    return res.data;
  },

  authorizePayment: async (
    claimId: number,
    authorizedBy: string,
    notes?: string
  ): Promise<PaymentAuthorization> => {
    const res = await api.post<PaymentAuthorization>(`/claims/${claimId}/authorize-payment`, {
      authorized_by: authorizedBy,
      notes,
    });
    return res.data;
  },

  liquidateClaim: async (
    claimId: number,
    authorizedBy: string = 'Oficial de Liquidación',
    bankAccountNumber?: string
  ): Promise<Claim> => {
    const res = await api.post<Claim>(`/claims/${claimId}/liquidate`, {
      authorized_by: authorizedBy,
      bank_account_number: bankAccountNumber,
    });
    return res.data;
  },
};
