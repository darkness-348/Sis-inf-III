import React from 'react';
import { 
  Shield, RefreshCw, LayoutDashboard, FileText, Search, 
  ShieldAlert, DollarSign, FolderCheck, UserCheck, LogOut, 
  User, PlusCircle, Clock 
} from 'lucide-react';
import { getUserRoleLabel } from '../utils/formatters';

interface NavbarProps {
  onRefresh: () => void;
  loading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser?: { username: string; full_name: string; role: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onRefresh, 
  loading, 
  activeTab, 
  onTabChange,
  currentUser,
  onLogout 
}) => {
  const isClient = currentUser?.role === 'CLIENT';

  return (
    <header style={{ marginBottom: '28px' }}>
      {/* DineroLi Inspired Top Nav Header */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 28px', 
          borderRadius: '20px 20px 0 0', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(18, 20, 26, 0.85)'
        }}
      >
        {/* Brand & Slogan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #236AFF 0%, #1042B8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(35, 106, 255, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Shield style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                DineroLi <span style={{ color: '#236AFF' }}>· Siniestros</span>
              </span>
              <span style={{ 
                fontSize: '0.68rem', 
                padding: '3px 10px', 
                borderRadius: '9999px', 
                background: 'rgba(35, 106, 255, 0.12)', 
                color: '#6597FF', 
                border: '1px solid rgba(35, 106, 255, 0.3)', 
                fontWeight: 700 
              }}>
                {isClient ? 'PORTAL ASEGURADO' : 'CONSOLA EJECUTIVA'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '1px' }}>
              Tu compañero financiero y de siniestros · UPDS
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentUser && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              border: '1px solid rgba(255, 255, 255, 0.08)' 
            }}>
              <div style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '50%', 
                background: 'rgba(35, 106, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <UserCheck style={{ width: '14px', height: '14px', color: '#6597FF' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: 700 }}>{currentUser.full_name}</span>
                <span style={{ fontSize: '0.63rem', color: '#6597FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {getUserRoleLabel(currentUser.role)}
                </span>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 14px', 
            borderRadius: '9999px', 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.2)' 
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>Servidor Activo</span>
          </div>

          <button 
            onClick={onRefresh} 
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.78rem' }}
          >
            <RefreshCw style={{ width: '13px', height: '13px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sincronizar</span>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout} 
              className="btn-secondary"
              style={{ 
                padding: '8px 14px', 
                fontSize: '0.78rem', 
                borderColor: 'rgba(239, 68, 68, 0.25)', 
                color: '#FCA5A5' 
              }}
              title="Cerrar Sesión"
            >
              <LogOut style={{ width: '13px', height: '13px' }} />
              <span>Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* Pill-Style Navigation Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '8px 14px', 
          borderRadius: '0 0 20px 20px', 
          display: 'flex', 
          gap: '6px', 
          overflowX: 'auto',
          background: 'rgba(14, 16, 21, 0.95)'
        }}
      >
        {isClient ? (
          <>
            <button 
              onClick={() => onTabChange('client_portal')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '0.8rem',
                background: (activeTab === 'client_portal' || activeTab === 'client_portal_track') ? '#236AFF' : 'transparent',
                borderColor: (activeTab === 'client_portal' || activeTab === 'client_portal_track') ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: (activeTab === 'client_portal' || activeTab === 'client_portal_track') ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <Clock style={{ width: '15px', height: '15px' }} />
              <span>Mis Siniestros y Estado</span>
            </button>

            <button 
              onClick={() => onTabChange('client_portal_report')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '0.8rem',
                background: activeTab === 'client_portal_report' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'client_portal_report' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'client_portal_report' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <PlusCircle style={{ width: '15px', height: '15px' }} />
              <span>Reportar Nuevo Siniestro</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onTabChange('client_portal')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'client_portal' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'client_portal' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'client_portal' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <User style={{ width: '14px', height: '14px' }} />
              <span>Portal Asegurado</span>
            </button>

            <button 
              onClick={() => onTabChange('dashboard')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'dashboard' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'dashboard' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'dashboard' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <LayoutDashboard style={{ width: '14px', height: '14px' }} />
              <span>Dashboard Métricas</span>
            </button>

            <button 
              onClick={() => onTabChange('claims')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'claims' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'claims' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'claims' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <FileText style={{ width: '14px', height: '14px' }} />
              <span>Gestión de Siniestros</span>
            </button>

            <button 
              onClick={() => onTabChange('verify')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'verify' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'verify' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'verify' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <Search style={{ width: '14px', height: '14px' }} />
              <span>Verificar Póliza</span>
            </button>

            <button 
              onClick={() => onTabChange('documents')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'documents' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'documents' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'documents' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <FolderCheck style={{ width: '14px', height: '14px' }} />
              <span>Documentos</span>
            </button>

            <button 
              onClick={() => onTabChange('fraud')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'fraud' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                borderColor: activeTab === 'fraud' ? '#EF4444' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'fraud' ? '#FCA5A5' : '#94A3B8'
              }}
            >
              <ShieldAlert style={{ width: '14px', height: '14px' }} />
              <span>Anti-Fraude</span>
            </button>

            <button 
              onClick={() => onTabChange('payments')} 
              className="btn-secondary"
              style={{ 
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: activeTab === 'payments' ? '#236AFF' : 'transparent',
                borderColor: activeTab === 'payments' ? '#236AFF' : 'rgba(255, 255, 255, 0.06)',
                color: activeTab === 'payments' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <DollarSign style={{ width: '14px', height: '14px' }} />
              <span>Autorizaciones</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};