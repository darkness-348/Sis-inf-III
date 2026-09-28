import React from 'react';
import { Shield, RefreshCw, LayoutDashboard, FileText, Search, ShieldAlert, DollarSign, FolderCheck, UserCheck, LogOut, User, PlusCircle, Clock } from 'lucide-react';
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
    <header style={{ marginBottom: '24px' }}>
      {/* Top Corporate Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 24px', 
          borderRadius: '12px 12px 0 0', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Shield style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                UNIVERSIDAD PRIVADA DOMINGO SAVIO
              </h1>
              <span style={{ fontSize: '0.675rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.2)', color: '#60A5FA', border: '1px solid rgba(37, 99, 235, 0.3)', fontWeight: 700 }}>
                {isClient ? 'PORTAL ASEGURADO' : 'SISTEMA ADMINISTRATIVO'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Sistema de Información de Gestión y Liquidación de Siniestros (Clean Architecture)</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              <UserCheck style={{ width: '15px', height: '15px', color: '#60A5FA' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.775rem', color: '#F8FAFC', fontWeight: 700 }}>{currentUser.full_name}</span>
                <span style={{ fontSize: '0.65rem', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rol: {getUserRoleLabel(currentUser.role)}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
            <span style={{ fontSize: '0.775rem', color: '#34D399', fontWeight: 600 }}>Servidor FastAPI Conectado</span>
          </div>

          <button 
            onClick={onRefresh} 
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Actualizar</span>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout} 
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}
              title="Cerrar Sesión Segura"
            >
              <LogOut style={{ width: '14px', height: '14px' }} />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Corporate Tab Navigation Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '0 16px', 
          borderRadius: '0 0 12px 12px', 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto',
          background: 'rgba(15, 23, 42, 0.95)'
        }}
      >
        {isClient ? (
          <>
            <button 
              onClick={() => onTabChange('client_portal')} 
              className={`tab-button ${activeTab === 'client_portal' || activeTab === 'client_portal_track' ? 'active' : ''}`}
              style={{ background: (activeTab === 'client_portal' || activeTab === 'client_portal_track') ? '#2563EB' : 'rgba(37, 99, 235, 0.15)', color: (activeTab === 'client_portal' || activeTab === 'client_portal_track') ? '#FFFFFF' : '#60A5FA' }}
            >
              <Clock style={{ width: '16px', height: '16px' }} />
              <span>Mis Siniestros y Estado</span>
            </button>

            <button 
              onClick={() => onTabChange('client_portal_report')} 
              className={`tab-button ${activeTab === 'client_portal_report' ? 'active' : ''}`}
              style={{ background: activeTab === 'client_portal_report' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)', color: activeTab === 'client_portal_report' ? '#FFFFFF' : '#94A3B8' }}
            >
              <PlusCircle style={{ width: '16px', height: '16px' }} />
              <span>Reportar Nuevo Siniestro</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onTabChange('client_portal')} 
              className={`tab-button ${activeTab === 'client_portal' ? 'active' : ''}`}
              style={{ background: activeTab === 'client_portal' ? '#2563EB' : 'rgba(37, 99, 235, 0.15)', color: activeTab === 'client_portal' ? '#FFFFFF' : '#60A5FA' }}
            >
              <User style={{ width: '16px', height: '16px' }} />
              <span>Portal del Cliente / Asegurado</span>
            </button>

            <button 
              onClick={() => onTabChange('dashboard')} 
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard style={{ width: '16px', height: '16px' }} />
              <span>Dashboard Operativo</span>
            </button>

            <button 
              onClick={() => onTabChange('claims')} 
              className={`tab-button ${activeTab === 'claims' ? 'active' : ''}`}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              <span>Gestión de Siniestros</span>
            </button>

            <button 
              onClick={() => onTabChange('verify')} 
              className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
            >
              <Search style={{ width: '16px', height: '16px' }} />
              <span>Verificación & Registro</span>
            </button>

            <button 
              onClick={() => onTabChange('documents')} 
              className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            >
              <FolderCheck style={{ width: '16px', height: '16px' }} />
              <span>Documentación (RF-02)</span>
            </button>

            <button 
              onClick={() => onTabChange('fraud')} 
              className={`tab-button ${activeTab === 'fraud' ? 'active' : ''}`}
            >
              <ShieldAlert style={{ width: '16px', height: '16px' }} />
              <span>Análisis Anti-Fraude (RF-06)</span>
            </button>

            <button 
              onClick={() => onTabChange('payments')} 
              className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            >
              <DollarSign style={{ width: '16px', height: '16px' }} />
              <span>Autorizaciones & Pagos</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
