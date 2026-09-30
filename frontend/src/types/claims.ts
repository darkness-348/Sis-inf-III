export type PolicyType = 'AUTO' | 'HOME' | 'COMMERCIAL' | 'HEALTH';
export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export type ClaimStatus =
  | 'RECEIVED'
  | 'VERIFYING'
  | 'ASSIGNED_TO_ADJUSTER'
  | 'UNDER_EVALUATION'
  | 'FRAUD_FLAGGED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'LIQUIDATED';

export type FraudRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalLevel = 'JUNIOR_ANALYST' | 'SENIOR_SUPERVISOR' | 'EXECUTIVE_DIRECTOR';

export interface Policy {
  id: number;
  policy_number: string;
  insured_name: string;
  insured_document: string;
  policy_type: PolicyType;
  coverage_amount: number;
  start_date: string;
  end_date: string;
  status: PolicyStatus;
  bank_account_number?: string;
}

export interface Adjuster {
  id: number;
  full_name: string;
  specialty: string;
  phone: string;
  email: string;
  is_active: boolean;
  active_claims_count: number;
}

export interface DamageAssessment {
  id: number;
  claim_id: number;
  adjuster_id: number;
  assessment_date: string;
  description: string;
  estimated_cost: number;
  labor_cost: number;
  parts_cost: number;
  approved_by_adjuster: boolean;
}

export interface FraudAnalysis {
  id: number;
  claim_id: number;
  total_score: number;
  risk_level: FraudRiskLevel;
  triggered_rules: string[];
  analysis_notes: string;
  analyzed_at: string;
}

export interface PaymentAuthorization {
  id: number;
  claim_id: number;
  authorized_amount: number;
  required_level: ApprovalLevel;
  authorized_by: string;
  status: string;
  authorization_date?: string;
  notes?: string;
}

export interface Claim {
  id: number;
  claim_number: string;
  policy_number: string;
  policy_id: number;
  incident_date: string;
  incident_description: string;
  incident_location: string;
  claimed_amount: number;
  status: ClaimStatus;
  created_at: string;
  adjuster_id?: number;
  fraud_risk_level: FraudRiskLevel;
  authorized_payment_amount?: number;
  bank_account_number?: string;
  liquidation_date?: string;
  assessment?: DamageAssessment;
  fraud_analysis?: FraudAnalysis;
  payment?: PaymentAuthorization;
}

export interface DashboardMetrics {
  total_claims: number;
  total_claimed_amount: number;
  total_authorized_amount: number;
  claims_by_status: Record<string, number>;
  high_risk_fraud_claims: number;
}

export interface ClaimCreatePayload {
  policy_number: string;
  incident_date: string;
  incident_description: string;
  incident_location: string;
  claimed_amount: number;
}
