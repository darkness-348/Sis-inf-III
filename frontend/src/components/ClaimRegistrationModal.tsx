import React, { useState, useEffect } from 'react';
import { PlusCircle, X, AlertCircle } from 'lucide-react';
import { claimsService } from '../services/claimsService';

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
  const [policyNumber, setPolicyNumber] = useState(prefilledPolicyNumber);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [claimedAmount, setClaimedAmount] = useState<number | ''>(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledPolicyNumber) {
      setPolicyNumber(prefilledPolicyNumber);
    }
  }, [prefilledPolicyNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber || !incidentDate || !incidentDescription || !incidentLocation || !claimedAmount) {
      setError('Por favor complete todos los campos obligatorios.');
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
            <label className="form-label">Número de Póliza Vigente *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: POL-2026-8801"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Fecha del Siniestro *</label>
              <input
                type="date"
                className="form-input"
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
            <button type="submit" className="btn-primary" disabled={loading}>
              <span>{loading ? 'Registrando...' : 'Registrar Siniestro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
