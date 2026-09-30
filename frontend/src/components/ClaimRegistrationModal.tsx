import React, { useState, useEffect } from 'react';
import { PlusCircle, X, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { claimsService } from '../services/claimsService';
import type { Policy } from '../types/claims';

interface ClaimRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledPolicyNumber?: string;
  onSuccess: () => void;
}

export const ClaimRegistrationModal: React.FC<ClaimRegistrationModalProps> = ({
  isOpen,
  onClose,
  prefilledPolicyNumber = '',
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const minDateStr = oneYearAgo.toISOString().split('T')[0];

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyNumber, setPolicyNumber] = useState(prefilledPolicyNumber);
  const [bankAccount, setBankAccount] = useState('CTA-BNC-88019482');
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [claimedAmount, setClaimedAmount] = useState<number | ''>(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      claimsService.getPolicies().then((fetched) => {
        setPolicies(fetched);
        const active = fetched.filter((p) => p.status === 'ACTIVE');
        if (prefilledPolicyNumber) {
          setPolicyNumber(prefilledPolicyNumber);
          const found = fetched.find((p) => p.policy_number === prefilledPolicyNumber);
          if (found && found.bank_account_number) {
            setBankAccount(found.bank_account_number);
          }
        } else if (active.length > 0 && !policyNumber) {
          setPolicyNumber(active[0].policy_number);
          if (active[0].bank_account_number) {
            setBankAccount(active[0].bank_account_number);
          }
        }
      }).catch(console.error);
    }
  }, [isOpen, prefilledPolicyNumber]);

  if (!isOpen) return null;

  const handlePolicyChange = (selectedNum: string) => {
    setPolicyNumber(selectedNum);
    const found = policies.find((p) => p.policy_number === selectedNum);
    if (found && found.bank_account_number) {
      setBankAccount(found.bank_account_number);
    }
  };

  // Date validation check
  const getDateValidationStatus = (dateStr: string) => {
    if (!dateStr) return { isValid: true, message: null, isWarning: false };
    if (dateStr > todayStr) {
      return {
        isValid: false,
        message: 'La fecha del siniestro no puede ser futura. Seleccione la fecha de hoy o una fecha pasada.',
        isWarning: false,
      };
    }
    if (dateStr < minDateStr) {
      return {
        isValid: false,
        message: 'No se pueden registrar siniestros con una antigüedad superior a 1 año (365 días).',
        isWarning: false,
      };
    }
    const selectedTime = new Date(dateStr + 'T00:00:00').getTime();
    const todayTime = new Date(todayStr + 'T00:00:00').getTime();
    const diffDays = Math.floor((todayTime - selectedTime) / (1000 * 60 * 60 * 24));
    if (diffDays > 60) {
      return {
        isValid: true,
        message: `⚠️ Atención: El siniestro ocurrió hace ${diffDays} días. Al registrarlo, el sistema lo marcará automáticamente con un FLAG (Sospecha / Revisión por reporte extemporáneo).`,
        isWarning: true,
      };
    }
    return { isValid: true, message: null, isWarning: false };
  };

  const dateStatus = getDateValidationStatus(incidentDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber || !incidentDate || !incidentDescription || !incidentLocation || !claimedAmount) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (!dateStatus.isValid) {
      setError(dateStatus.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await claimsService.registerClaim({
        policy_number: policyNumber.trim(),
        incident_date: incidentDate,
        incident_description: incidentDescription.trim(),
        incident_location: incidentLocation.trim(),
        claimed_amount: Number(claimedAmount),
        bank_account_number: bankAccount.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el siniestro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlusCircle style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Recepción de Nuevo Siniestro</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Seleccionar Póliza Activa (Asignación Automática) *</label>
            {policies.length > 0 ? (
              <select
                className="form-input"
                value={policyNumber}
                onChange={(e) => handlePolicyChange(e.target.value)}
                required
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.policy_number}>
                    {p.policy_number} — {p.insured_name} ({p.policy_type}) — Cobertura: ${p.coverage_amount.toLocaleString()} USD
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-input"
                placeholder="Ej: POL-2026-8801"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                required
              />
            )}
          </div>

          <div>
            <label className="form-label">Número de Cuenta Bancaria (para Acreditación / Liquidación) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: CTA-BNC-88019482"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Esta cuenta se guardará en el expediente y será utilizada para efectuar el pago al autorizar la liquidación.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Fecha del Siniestro *</label>
              <input
                type="date"
                className="form-input"
                max={todayStr}
                min={minDateStr}
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Monto Reclamado ($ USD) *</label>
              <input
                type="number"
                step="100"
                className="form-input"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Date validation message / warning */}
          {dateStatus.message && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: dateStatus.isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: dateStatus.isWarning ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: dateStatus.isWarning ? '#FCD34D' : '#FCA5A5',
              }}
            >
              {dateStatus.isWarning ? (
                <ShieldAlert style={{ width: '18px', height: '18px', flexShrink: 0, color: '#FCD34D' }} />
              ) : (
                <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0, color: '#FCA5A5' }} />
              )}
              <span>{dateStatus.message}</span>
            </div>
          )}

          <div>
            <label className="form-label">Lugar de Ocurrencia *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Av. Las Américas 104, Sector Norte"
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Descripción Detallada de los Hechos *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Describa cómo ocurrió el incidente, extensión aparente de daños y circunstancias..."
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !dateStatus.isValid}>
              <span>{loading ? 'Registrando...' : 'Registrar Siniestro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

