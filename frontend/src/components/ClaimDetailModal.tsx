import React, { useState, useEffect } from 'react';
import { 
  X, UserCheck, ShieldAlert, DollarSign, CheckCircle2, 
  FileSpreadsheet, AlertTriangle, Award, FileCheck
} from 'lucide-react';
import { claimsService } from '../services/claimsService';
import type { Claim, Adjuster } from '../types/claims';
import { getClaimStatusLabel, getClaimStatusBadgeClass } from '../utils/formatters';

interface ClaimDetailModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenDocuments?: () => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  isOpen,
  onClose,
  onRefresh,
  onOpenDocuments,
}) => {
  const [adjusters, setAdjusters] = useState<Adjuster[]>([]);
  const [selectedAdjusterId, setSelectedAdjusterId] = useState<number | ''>('');

  const [assessmentDesc, setAssessmentDesc] = useState('');
  const [partsCost, setPartsCost] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(0);

  const [authorizedBy, setAuthorizedBy] = useState('Lic. Carlos Analyst');
  const [paymentNotes] = useState('');

  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      claimsService.getAdjusters().then(setAdjusters).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (claim && claim.assessment) {
      setAssessmentDesc(claim.assessment.description);
      setPartsCost(claim.assessment.parts_cost);
      setLaborCost(claim.assessment.labor_cost);
    } else if (claim) {
      setPartsCost(Math.round(claim.claimed_amount * 0.7));
      setLaborCost(Math.round(claim.claimed_amount * 0.3));
    }
  }, [claim]);

  if (!isOpen || !claim) return null;

  const estimatedTotal = (Number(partsCost) || 0) + (Number(laborCost) || 0);

  const handleAssignAdjuster = async () => {
    if (!selectedAdjusterId) return;
    setLoadingAction(true);
    setActionError(null);
    try {
      await claimsService.assignAdjuster(claim.id, Number(selectedAdjusterId));
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!assessmentDesc || !claim.adjuster_id) return;
    setLoadingAction(true);
    setActionError(null);
    try {
      await claimsService.recordAssessment(claim.id, {
        adjuster_id: claim.adjuster_id,
        description: assessmentDesc,
        estimated_cost: estimatedTotal,
        labor_cost: Number(laborCost),
        parts_cost: Number(partsCost),
      });
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAuthorizePayment = async () => {
    setLoadingAction(true);
    setActionError(null);
    try {
      await claimsService.authorizePayment(claim.id, authorizedBy, paymentNotes);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLiquidate = async () => {
    setLoadingAction(true);
    setActionError(null);
    try {
      await claimsService.liquidateClaim(claim.id, authorizedBy);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Expediente de Siniestro #{claim.claim_number}</h2>
              <span className={`badge ${getClaimStatusBadgeClass(claim.status)}`}>{getClaimStatusLabel(claim.status)}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Póliza amparada: <strong>{claim.policy_number}</strong> | Fecha de ocurrencia: {claim.incident_date}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {actionError && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem' }}>{actionError}</span>
          </div>
        )}

        {/* Stepper Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.675rem', color: '#60A5FA', textTransform: 'uppercase', fontWeight: 700 }}>Fase 1</span>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'white' }}>Recepción & Póliza</div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: claim.adjuster_id ? 'rgba(2, 132, 199, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: claim.adjuster_id ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.675rem', color: '#38BDF8', textTransform: 'uppercase', fontWeight: 700 }}>Fase 2</span>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'white' }}>Asignación Perito</div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: claim.assessment ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: claim.assessment ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.675rem', color: '#FCD34D', textTransform: 'uppercase', fontWeight: 700 }}>Fase 3</span>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'white' }}>Evaluación Daños</div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: claim.fraud_analysis ? (claim.fraud_risk_level === 'CRITICAL' || claim.fraud_risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)') : 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.675rem', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: 700 }}>Fase 4</span>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'white' }}>Reglas Anti-Fraude</div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: claim.status === 'APPROVED' || claim.status === 'LIQUIDATED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.675rem', color: '#6EE7B7', textTransform: 'uppercase', fontWeight: 700 }}>Fase 5</span>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'white' }}>Pago & Liquidación</div>
          </div>
        </div>

        {/* Details & Anti-Fraud Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

          {/* Claim Info */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.4)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60A5FA', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
              Detalles de la Notificación
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#E2E8F0' }}>
              <div><strong>Lugar:</strong> {claim.incident_location}</div>
              <div><strong>Monto Reclamado:</strong> ${claim.claimed_amount.toLocaleString()} USD</div>
              <div><strong>Descripción:</strong> {claim.incident_description}</div>
            </div>
            {onOpenDocuments && (
              <button
                onClick={onOpenDocuments}
                className="btn-secondary"
                style={{ marginTop: '14px', width: '100%', justifyContent: 'center', padding: '6px 12px', fontSize: '0.775rem' }}
              >
                <FileCheck style={{ width: '14px', height: '14px', color: '#60A5FA' }} />
                <span>Gestionar Documentación Anexa (RF-02)</span>
              </button>
            )}
          </div>

          {/* Fraud Rule Engine */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.4)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert style={{ width: '16px', height: '16px' }} />
              Auditoría del Motor Anti-Fraude (RF-06)
            </h3>
            {claim.fraud_analysis ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Puntaje de Riesgo Acumulado:</span>
                  <strong style={{ fontSize: '1.1rem', color: claim.fraud_analysis.total_score >= 50 ? '#EF4444' : '#34D399' }}>
                    {claim.fraud_analysis.total_score} / 100
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.775rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Reglas de Sospecha Activadas:</span>
                  {claim.fraud_analysis.triggered_rules.length > 0 ? (
                    <ul style={{ paddingLeft: '16px', fontSize: '0.775rem', color: '#FCA5A5' }}>
                      {claim.fraud_analysis.triggered_rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.775rem', color: '#34D399' }}>Ninguna regla de sospecha activada.</span>
                  )}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pendiente de análisis anti-fraude.</span>
            )}
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'white', marginBottom: '14px' }}>Procesamiento del Flujo de Trabajo</h3>

          {/* Action 1: Assign Adjuster */}
          {!claim.adjuster_id && (
            <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#38BDF8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck style={{ width: '16px', height: '16px' }} />
                1. Asignación de Perito Ajustador (RF-04)
              </h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  className="form-input"
                  value={selectedAdjusterId}
                  onChange={(e) => setSelectedAdjusterId(Number(e.target.value))}
                >
                  <option value="">-- Seleccionar Perito Disponible --</option>
                  {adjusters.map((adj) => (
                    <option key={adj.id} value={adj.id}>
                      {adj.full_name} ({adj.specialty}) - Carga: {adj.active_claims_count} asignados
                    </option>
                  ))}
                </select>
                <button onClick={handleAssignAdjuster} className="btn-primary" disabled={loadingAction || !selectedAdjusterId}>
                  Asignar Perito
                </button>
              </div>
            </div>
          )}

          {/* Action 2: Damage Assessment Form */}
          {claim.adjuster_id && !claim.assessment && (
            <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FCD34D', marginBottom: '8px' }}>
                2. Informe Técnico y Evaluación de Daños (RF-04)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Repuestos ($)</label>
                  <input type="number" className="form-input" value={partsCost} onChange={(e) => setPartsCost(Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Mano de Obra ($)</label>
                  <input type="number" className="form-input" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Total Avalado ($)</label>
                  <input type="number" className="form-input" value={estimatedTotal} readOnly style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#34D399', fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="form-label">Dictamen Técnico del Perito</label>
                <textarea className="form-input" rows={2} value={assessmentDesc} onChange={(e) => setAssessmentDesc(e.target.value)} placeholder="Detalle técnico de la inspección..." />
              </div>
              <button onClick={handleSaveAssessment} className="btn-primary" disabled={loadingAction}>
                Guardar Evaluación de Daños
              </button>
            </div>
          )}

          {/* Registered Assessment */}
          {claim.assessment && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FCD34D', marginBottom: '4px' }}>Evaluación Pericial Registrada</h4>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>{claim.assessment.description}</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.775rem', color: '#94A3B8' }}>
                <span>Repuestos: ${claim.assessment.parts_cost.toLocaleString()}</span>
                <span>Mano de obra: ${claim.assessment.labor_cost.toLocaleString()}</span>
                <strong style={{ color: '#34D399' }}>Total Peritado: ${claim.assessment.estimated_cost.toLocaleString()} USD</strong>
              </div>
            </div>
          )}

          {/* Action 3: Payment Approval according to Hierarchy */}
          {claim.status !== 'APPROVED' && claim.status !== 'LIQUIDATED' && claim.status !== 'FRAUD_FLAGGED' && (
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award style={{ width: '16px', height: '16px' }} />
                3. Autorización de Pago por Nivel de Jerarquía (RF-05 / RF-07)
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#94A3B8', marginBottom: '10px' }}>
                Monto a autorizar: <strong>${(claim.assessment ? claim.assessment.estimated_cost : claim.claimed_amount).toLocaleString()} USD</strong> —
                {(claim.assessment ? claim.assessment.estimated_cost : claim.claimed_amount) <= 5000 ? (
                  <span style={{ color: '#60A5FA', fontWeight: 700 }}> Requiere Aprobación: Analista Junior (&lt; $5,000)</span>
                ) : (claim.assessment ? claim.assessment.estimated_cost : claim.claimed_amount) <= 25000 ? (
                  <span style={{ color: '#FCD34D', fontWeight: 700 }}> Requiere Aprobación: Supervisor Senior (&lt; $25,000)</span>
                ) : (
                  <span style={{ color: '#FCA5A5', fontWeight: 700 }}> Requiere Aprobación: Director Ejecutivo (&gt; $25,000)</span>
                )}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de la Autoridad Aprobadora"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                />
                <button onClick={handleAuthorizePayment} className="btn-primary" disabled={loadingAction}>
                  <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                  <span>Autorizar Pago</span>
                </button>
              </div>
            </div>
          )}

          {/* Action 4: Final Liquidation */}
          {claim.status === 'APPROVED' && (
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>Generación de Orden de Pago y Liquidación (RF-10)</h4>
                <p style={{ fontSize: '0.775rem', color: '#CBD5E1' }}>Pago autorizado por ${claim.authorized_payment_amount?.toLocaleString()} USD. Envío de solicitud a Finanzas.</p>
              </div>
              <button onClick={handleLiquidate} className="btn-primary" style={{ background: '#10B981' }} disabled={loadingAction}>
                <DollarSign style={{ width: '16px', height: '16px' }} />
                <span>Efectuar Liquidación a Finanzas</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
