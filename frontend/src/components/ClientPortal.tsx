import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, Search, PlusCircle, 
  CheckCircle2, Clock, Calendar, MapPin, DollarSign, 
  UserCheck, ArrowRight, RefreshCw, FileText
} from 'lucide-react';
import type { Claim } from '../types/claims';
import { claimsService } from '../services/claimsService';
import { getClaimStatusLabel, getClaimStatusBadgeClass, formatCurrency } from '../utils/formatters';

interface ClientPortalProps {
  claims: Claim[];
  onRefresh: () => void;
  onOpenDocuments: (claim: Claim) => void;
  currentUser?: { username: string; full_name: string; role: string } | null;
  initialSubTab?: 'track' | 'report';
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  claims,
  onRefresh,
  onOpenDocuments,
  currentUser,
  initialSubTab = 'track',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'track' | 'report'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected claim for detail timeline
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(
    claims.length > 0 ? claims[0].id : null
  );

  // New Claim Form state
  const [policyNumber, setPolicyNumber] = useState('POL-2026-8801');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState<number | ''>(2500);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered claims based on search query or policy
  const filteredClaims = claims.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      c.claim_number.toLowerCase().includes(query) ||
      c.policy_number.toLowerCase().includes(query) ||
      c.incident_description.toLowerCase().includes(query) ||
      c.incident_location.toLowerCase().includes(query)
    );
  });

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || (filteredClaims.length > 0 ? filteredClaims[0] : null);

  const handleReportClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber || !incidentDate || !incidentLocation || !incidentDescription || !claimedAmount) {
      setError('Por favor complete todos los campos obligatorios del formulario.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newClaim = await claimsService.registerClaim({
        policy_number: policyNumber.trim(),
        incident_date: incidentDate,
        incident_description: incidentDescription.trim(),
        incident_location: incidentLocation.trim(),
        claimed_amount: Number(claimedAmount),
      });

      setSuccessMessage(`¡Siniestro reportado con éxito! Se ha creado el Expediente Nº ${newClaim.claim_number}.`);
      setIncidentDescription('');
      setIncidentLocation('');
      onRefresh();
      
      // Select the newly created claim and switch to tracking tab
      setSelectedClaimId(newClaim.id);
      setTimeout(() => {
        setActiveSubTab('track');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el siniestro. Verifique el número de póliza.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine the current progress step (1 to 5) for active claim
  const getProgressStep = (claim: Claim): number => {
    switch (claim.status) {
      case 'RECEIVED':
      case 'VERIFYING':
        return 1;
      case 'ASSIGNED_TO_ADJUSTER':
        return 2;
      case 'UNDER_EVALUATION':
      case 'FRAUD_FLAGGED':
        return 3;
      case 'PENDING_APPROVAL':
      case 'APPROVED':
        return 4;
      case 'LIQUIDATED':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
      {/* Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px 32px', 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1E3A8A 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#60A5FA', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px' }} />
            <span>PORTAL DE AUTO-ATENCIÓN PARA CLIENTES Y ASEGURADOS</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Bienvenido, {currentUser ? currentUser.full_name : 'Estimado Cliente'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '8px', lineHeight: 1.5 }}>
            Reporte un nuevo siniestro de manera ágil y realice el seguimiento en tiempo real del estado de liquidación de su póliza.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('report')}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.875rem', borderRadius: '10px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
          >
            <PlusCircle style={{ width: '18px', height: '18px' }} />
            <span>Reportar un Siniestro</span>
          </button>
          <button
            onClick={() => setActiveSubTab('track')}
            className="btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.875rem', borderRadius: '10px' }}
          >
            <Search style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
            <span>Consultar Mis Siniestros</span>
          </button>
        </div>
      </div>

      {/* Portal Navigation Sub-tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('track')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'track' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
            color: activeSubTab === 'track' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.2s'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          <span>Seguimiento de Estado ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('report')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'report' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
            color: activeSubTab === 'report' ? '#FFFFFF' : '#94A3B8',
            transition: 'all 0.2s'
          }}
        >
          <PlusCircle style={{ width: '16px', height: '16px' }} />
          <span>Formulario de Reporte de Siniestro</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* SUB-TAB 1: TRACKING & STATUS */}
      {activeSubTab === 'track' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Search Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#94A3B8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
                placeholder="Buscar por código de siniestro (Ej: SIN-2026-0001) o número de póliza..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={onRefresh} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '0.8rem' }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Actualizar Estado</span>
            </button>
          </div>

          {/* If no claims exist */}
          {claims.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
              <FileText style={{ width: '48px', height: '48px', color: '#64748B', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 700 }}>No hay siniestros registrados a su nombre</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px', maxWidth: '500px', margin: '6px auto 20px auto' }}>
                Si ha sufrido un evento o colisión cubierto por su póliza, puede reportarlo directamente utilizando nuestro formulario en línea.
              </p>
              <button onClick={() => setActiveSubTab('report')} className="btn-primary">
                <PlusCircle style={{ width: '16px', height: '16px' }} />
                <span>Reportar Mi Primer Siniestro</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', flexWrap: 'wrap' }}>
              {/* Claims Sidebar Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mis Siniestros Reportados ({filteredClaims.length})
                </h3>
                
                {filteredClaims.map((claim) => {
                  const isSelected = activeClaim?.id === claim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem' }}>{claim.claim_number}</span>
                        <span className={`badge ${getClaimStatusBadgeClass(claim.status)}`} style={{ fontSize: '0.675rem' }}>
                          {getClaimStatusLabel(claim.status)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '6px' }}>
                        Póliza: <strong>{claim.policy_number}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
                        <span>Fecha: {claim.incident_date}</span>
                        <strong style={{ color: '#818CF8' }}>{formatCurrency(claim.claimed_amount)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Claim Main Tracking Detail */}
              {activeClaim && (
                <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
                  {/* Claim Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Expediente de Siniestro
                      </span>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
                        {activeClaim.claim_number}
                      </h2>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: '#94A3B8' }}>
                        <span>Póliza: <strong style={{ color: '#E2E8F0' }}>{activeClaim.policy_number}</strong></span>
                        <span>Fecha Evento: <strong style={{ color: '#E2E8F0' }}>{activeClaim.incident_date}</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Estado Actual:</span>
                      <span className={`badge ${getClaimStatusBadgeClass(activeClaim.status)}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        {getClaimStatusLabel(activeClaim.status)}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL TIMELINE PROGRESS TRACKER (5 STAGES) */}
                  <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Línea de Tiempo del Proceso de Liquidación
                    </h3>

                    {/* Step Progress Line */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', position: 'relative' }}>
                      
                      {/* Step 1 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getProgressStep(activeClaim) >= 1 ? '#2563EB' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          border: getProgressStep(activeClaim) >= 1 ? '2px solid #60A5FA' : 'none',
                          boxShadow: getProgressStep(activeClaim) === 1 ? '0 0 15px rgba(37, 99, 235, 0.6)' : 'none'
                        }}>
                          {getProgressStep(activeClaim) > 1 ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : '1'}
                        </div>
                        <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: getProgressStep(activeClaim) >= 1 ? '#F8FAFC' : '#64748B' }}>
                          Recepción
                        </h4>
                        <p style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '2px' }}>Siniestro registrado</p>
                      </div>

                      {/* Step 2 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getProgressStep(activeClaim) >= 2 ? '#2563EB' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          border: getProgressStep(activeClaim) >= 2 ? '2px solid #60A5FA' : 'none',
                          boxShadow: getProgressStep(activeClaim) === 2 ? '0 0 15px rgba(37, 99, 235, 0.6)' : 'none'
                        }}>
                          {getProgressStep(activeClaim) > 2 ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : '2'}
                        </div>
                        <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: getProgressStep(activeClaim) >= 2 ? '#F8FAFC' : '#64748B' }}>
                          Asignación Perito
                        </h4>
                        <p style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '2px' }}>Ajustador asignado</p>
                      </div>

                      {/* Step 3 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getProgressStep(activeClaim) >= 3 ? '#2563EB' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          border: getProgressStep(activeClaim) >= 3 ? '2px solid #60A5FA' : 'none',
                          boxShadow: getProgressStep(activeClaim) === 3 ? '0 0 15px rgba(37, 99, 235, 0.6)' : 'none'
                        }}>
                          {getProgressStep(activeClaim) > 3 ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : '3'}
                        </div>
                        <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: getProgressStep(activeClaim) >= 3 ? '#F8FAFC' : '#64748B' }}>
                          Evaluación Daños
                        </h4>
                        <p style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '2px' }}>Inspección técnica</p>
                      </div>

                      {/* Step 4 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getProgressStep(activeClaim) >= 4 ? '#2563EB' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          border: getProgressStep(activeClaim) >= 4 ? '2px solid #60A5FA' : 'none',
                          boxShadow: getProgressStep(activeClaim) === 4 ? '0 0 15px rgba(37, 99, 235, 0.6)' : 'none'
                        }}>
                          {getProgressStep(activeClaim) > 4 ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : '4'}
                        </div>
                        <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: getProgressStep(activeClaim) >= 4 ? '#F8FAFC' : '#64748B' }}>
                          Aprobación Pago
                        </h4>
                        <p style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '2px' }}>Autorización dictamen</p>
                      </div>

                      {/* Step 5 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getProgressStep(activeClaim) >= 5 ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          border: getProgressStep(activeClaim) >= 5 ? '2px solid #34D399' : 'none',
                          boxShadow: getProgressStep(activeClaim) === 5 ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none'
                        }}>
                          {getProgressStep(activeClaim) === 5 ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : '5'}
                        </div>
                        <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: getProgressStep(activeClaim) >= 5 ? '#34D399' : '#64748B' }}>
                          Liquidado
                        </h4>
                        <p style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '2px' }}>Desembolso efectuado</p>
                      </div>

                    </div>
                  </div>

                  {/* Incident Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.4)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60A5FA', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin style={{ width: '16px', height: '16px' }} />
                        Lugar y Descripción del Incidente
                      </h4>
                      <div style={{ fontSize: '0.825rem', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Lugar:</strong> {activeClaim.incident_location}</div>
                        <div><strong>Detalle:</strong> {activeClaim.incident_description}</div>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.4)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818CF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign style={{ width: '16px', height: '16px' }} />
                        Montos del Siniestro
                      </h4>
                      <div style={{ fontSize: '0.825rem', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Monto Solicitado:</strong> {formatCurrency(activeClaim.claimed_amount)}</div>
                        <div>
                          <strong>Monto Autorizado / Pagado:</strong>{' '}
                          <span style={{ color: activeClaim.authorized_payment_amount ? '#34D399' : '#94A3B8', fontWeight: 700 }}>
                            {activeClaim.authorized_payment_amount ? formatCurrency(activeClaim.authorized_payment_amount) : 'Pendiente de cálculo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Assessment details if evaluated */}
                  {activeClaim.assessment && (
                    <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FCD34D', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck style={{ width: '16px', height: '16px' }} />
                        Informe Técnico de Inspección Pericial
                      </h4>
                      <p style={{ fontSize: '0.825rem', color: '#CBD5E1' }}>{activeClaim.assessment.description}</p>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '0.775rem', color: '#94A3B8' }}>
                        <span>Repuestos: ${activeClaim.assessment.parts_cost.toLocaleString()}</span>
                        <span>Mano de Obra: ${activeClaim.assessment.labor_cost.toLocaleString()}</span>
                        <strong style={{ color: '#34D399' }}>Total Peritado: ${activeClaim.assessment.estimated_cost.toLocaleString()} USD</strong>
                      </div>
                    </div>
                  )}

                  {/* Documentation Attachment Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                      ¿Necesita adjuntar respaldos (fotos, denuncias policiales, facturas)?
                    </p>
                    <button
                      onClick={() => onOpenDocuments(activeClaim)}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      <FileText style={{ width: '14px', height: '14px', color: '#60A5FA' }} />
                      <span>Adjuntar Documentación Anexa</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: REPORT NEW CLAIM FORM */}
      {activeSubTab === 'report' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '780px', margin: '0 auto', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlusCircle style={{ width: '22px', height: '22px', color: '#2563EB' }} />
              Formulario de Declaración y Reporte de Siniestro
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
              Ingrese los detalles del evento perjudicial para dar inicio formal al expediente de liquidación.
            </p>
          </div>

          <form onSubmit={handleReportClaim} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
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
              <span style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Pólizas demo activas: POL-2026-8801 (Juan Pérez Auto), POL-2026-8802 (María Hogar), POL-2026-8803 (Comercial).
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Fecha de Ocurrencia del Evento *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Monto Estimado Reclamado ($ USD) *</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
                  <input
                    type="number"
                    step="100"
                    min="100"
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                    placeholder="2500"
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Lugar o Dirección Exacta del Incidente *</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="Ej: Av. Las Américas y Calle 4, Zona Norte"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Descripción Detallada de los Hechos y Daños *</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Describa claramente lo sucedido: causas del accidente, terceros involucrados, partes u objetos afectados..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveSubTab('track')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ padding: '10px 24px' }}
              >
                {loading ? 'Registrando Expediente...' : 'Enviar Reporte de Siniestro'}
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};
