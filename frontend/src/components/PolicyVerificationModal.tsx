import React, { useState } from 'react';
import { Search, X, CheckCircle, AlertCircle, ShieldCheck, User } from 'lucide-react';
import { claimsService } from '../services/claimsService';
import type { Policy } from '../types/claims';
import { getPolicyStatusLabel, getPolicyTypeLabel } from '../utils/formatters';

interface PolicyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPolicyForClaim: (policyNumber: string) => void;
}

export const PolicyVerificationModal: React.FC<PolicyVerificationModalProps> = ({
  isOpen,
  onClose,
  onSelectPolicyForClaim,
}) => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim()) return;

    setLoading(true);
    setError(null);
    setPolicy(null);

    try {
      const data = await claimsService.getPolicyByNumber(policyNumber.trim());
      setPolicy(data);
    } catch (err: any) {
      setError(err.message || 'No se encontró la póliza especificada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ width: '22px', height: '22px', color: '#2563EB' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Verificación de Póliza Vigente (RF-01)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} style={{ marginBottom: '20px' }}>
          <label className="form-label">Número de Póliza de Seguro</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: POL-2026-8801"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '8px 16px' }}>
              <Search style={{ width: '15px', height: '15px' }} />
              <span>{loading ? 'Consultando...' : 'Verificar'}</span>
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
            Pólizas de muestra activas: POL-2026-8801 (Auto), POL-2026-8802 (Hogar), POL-2025-4100 (Vencida)
          </p>
        </form>

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {policy && (
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.5)', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Código de Póliza #{policy.policy_number}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
                  {policy.insured_name}
                </h4>
              </div>
              <span className={`badge ${policy.status === 'ACTIVE' ? 'badge-approved' : 'badge-fraud'}`}>
                {getPolicyStatusLabel(policy.status)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.825rem', color: '#CBD5E1' }}>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.725rem' }}>Ramo Cobertura</span>
                <strong>{getPolicyTypeLabel(policy.policy_type)}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.725rem' }}>Monto Máximo Cobertura</span>
                <strong style={{ color: '#34D399' }}>${policy.coverage_amount.toLocaleString()} USD</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.725rem' }}>Inicio Vigencia</span>
                <span>{policy.start_date}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.725rem' }}>Fin Vigencia</span>
                <span>{policy.end_date}</span>
              </div>
            </div>

            {policy.status === 'ACTIVE' ? (
              <button
                onClick={() => {
                  onSelectPolicyForClaim(policy.policy_number);
                  onClose();
                }}
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
              >
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                <span>Proceder a Registrar Siniestro con esta Póliza</span>
              </button>
            ) : (
              <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '6px', fontSize: '0.775rem', textAlign: 'center', fontWeight: 600 }}>
                Restricción: No se pueden aperturear reclamos en pólizas vencidas o inactivas.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
