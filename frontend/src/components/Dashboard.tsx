import React from 'react';
import { 
  FileText, DollarSign, ShieldAlert, 
  TrendingUp, Search, PlusCircle
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
      {/* Executive Header Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            Consola Operativa de Gestión y Liquidación de Siniestros
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
            Flujo reglamentado: Verificación de Póliza ➔ Registro Siniestro ➔ Inspección Pericial ➔ Evaluación Anti-Fraude ➔ Aprobación & Liquidación
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onOpenVerifyPolicyModal} className="btn-secondary">
            <Search style={{ width: '15px', height: '15px', color: '#60A5FA' }} />
            <span>1. Verificar Póliza Vigente</span>
          </button>
          <button onClick={onOpenNewClaimModal} className="btn-primary">
            <PlusCircle style={{ width: '16px', height: '16px' }} />
            <span>2. Registrar Siniestro</span>
          </button>
        </div>
      </div>

      {/* KPI Executive Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        
        {/* Total Claims Card */}
        <div 
          className="glass-panel" 
          onClick={() => onFilterStatus(null)}
          style={{ 
            padding: '20px', 
            cursor: 'pointer',
            borderColor: activeStatusFilter === null ? '#2563EB' : 'rgba(255, 255, 255, 0.08)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Siniestros Totales
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>
              <FileText style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC' }}>{metrics.total_claims}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Registrados en la plataforma</div>
        </div>

        {/* Claimed Amount Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Monto Reclamado
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
              <DollarSign style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#818CF8' }}>
            ${metrics.total_claimed_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Suma bruta solicitada</div>
        </div>

        {/* Liquidated Amount Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Monto Liquidado
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <TrendingUp style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34D399' }}>
            ${metrics.total_authorized_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Desembolsos aprobados</div>
        </div>

        {/* Fraud Risk Alerts Card */}
        <div 
          className="glass-panel" 
          onClick={() => onFilterStatus('FRAUD_FLAGGED')}
          style={{ 
            padding: '20px', 
            cursor: 'pointer',
            borderColor: activeStatusFilter === 'FRAUD_FLAGGED' ? '#EF4444' : 'rgba(255, 255, 255, 0.08)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Alertas Anti-Fraude
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <ShieldAlert style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#EF4444' }}>
            {metrics.high_risk_fraud_claims}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '4px' }}>Casos en auditoría especial</div>
        </div>

      </div>
    </div>
  );
};
