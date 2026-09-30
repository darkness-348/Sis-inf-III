import React from 'react';
import { 
  FileText, DollarSign, ShieldAlert, 
  Search, PlusCircle, CheckCircle2
} from 'lucide-react';
import type { DashboardMetrics } from '../types/claims';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  onOpenNewClaimModal: () => void;
  onOpenVerifyPolicyModal: () => void;
  onFilterStatus: (status: string | null) => void;
  activeStatusFilter: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  onOpenNewClaimModal,
  onOpenVerifyPolicyModal,
  onFilterStatus,
  activeStatusFilter,
}) => {
  if (!metrics) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '28px' }}>
      
      {/* DineroLi Hero Banner */}
      <div 
        className="dineroli-banner" 
        style={{ 
          padding: '28px 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '4px 12px', 
            borderRadius: '9999px', 
            background: 'rgba(35, 106, 255, 0.15)', 
            border: '1px solid rgba(35, 106, 255, 0.3)',
            marginBottom: '10px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#236AFF' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6597FF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Inteligencia Financiera y Siniestros
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
            Impulsa la Liquidación de tus Siniestros Hoy
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '8px', lineHeight: 1.6 }}>
            Supervise siniestros en tiempo real, controle presupuestos y prevenga fraudes con análisis automatizado de pólizas y peritajes de acuerdo a estándares UPDS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onOpenVerifyPolicyModal} className="btn-secondary">
            <Search style={{ width: '15px', height: '15px', color: '#6597FF' }} />
            <span>Verificar Póliza</span>
          </button>
          <button onClick={onOpenNewClaimModal} className="btn-primary">
            <PlusCircle style={{ width: '16px', height: '16px' }} />
            <span>Registrar Siniestro</span>
          </button>
        </div>
      </div>

      {/* DineroLi "Our Numbers" Metric Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
              Métricas Clave del Sistema
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Indicadores de desempeño operacional y financiero en tiempo real
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* Total Claims Card */}
          <div 
            className="dineroli-stat-card" 
            onClick={() => onFilterStatus(null)}
            style={{ 
              cursor: 'pointer',
              borderColor: activeStatusFilter === null ? '#236AFF' : 'rgba(255, 255, 255, 0.06)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Siniestros Totales
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 106, 255, 0.15)', color: '#6597FF' }}>
                <FileText style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
              {metrics.total_claims}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Expedientes registrados en la plataforma
            </div>
          </div>

          {/* Claimed Amount Card */}
          <div className="dineroli-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monto Reclamado
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(101, 151, 255, 0.15)', color: '#B7CEFF' }}>
                <DollarSign style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#6597FF', letterSpacing: '-0.02em' }}>
              ${metrics.total_claimed_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Suma total reclamada por asegurados
            </div>
          </div>

          {/* Authorized Amount Card */}
          <div 
            className="dineroli-stat-card"
            onClick={() => onFilterStatus('APPROVED')}
            style={{ 
              cursor: 'pointer',
              borderColor: activeStatusFilter === 'APPROVED' ? '#10B981' : 'rgba(255, 255, 255, 0.06)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Autorizado
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34D399', letterSpacing: '-0.02em' }}>
              ${metrics.total_authorized_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Monto con visto bueno para pago
            </div>
          </div>

          {/* Fraud Flagged Card */}
          <div 
            className="dineroli-stat-card"
            onClick={() => onFilterStatus('FRAUD_FLAGGED')}
            style={{ 
              cursor: 'pointer',
              borderColor: activeStatusFilter === 'FRAUD_FLAGGED' ? '#EF4444' : 'rgba(255, 255, 255, 0.06)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Riesgo de Fraude
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>
                <ShieldAlert style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F87171', letterSpacing: '-0.03em' }}>
              {metrics.high_risk_fraud_claims}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Casos con riesgo crítico / alto (RF-06)
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};