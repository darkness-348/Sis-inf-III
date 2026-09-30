import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClaimsList } from './components/ClaimsList';
import { ClientPortal } from './components/ClientPortal';
import { PoliciesList } from './components/PoliciesList';
import { PolicyVerificationModal } from './components/PolicyVerificationModal';
import { ClaimRegistrationModal } from './components/ClaimRegistrationModal';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { DocumentsModal } from './components/DocumentsModal';
import { AuthModal } from './components/AuthModal';
import { claimsService } from './services/claimsService';
import { authService } from './services/authService';
import type { Claim, DashboardMetrics } from './types/claims';
import { getUserRoleLabel } from './utils/formatters';
import { 
  RefreshCw, LogOut, LayoutDashboard, FileText, Search, 
  ShieldAlert, FolderCheck, DollarSign, PlusCircle,
  User, Bell, AlertCircle, Menu, ShieldCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getStoredUser());

  const [claims, setClaims] = useState<Claim[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('general');

  // Modals state
  const [isVerifyPolicyModalOpen, setIsVerifyPolicyModalOpen] = useState(false);
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [prefilledPolicyNumber, setPrefilledPolicyNumber] = useState('');

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  const userRole = currentUser?.role || 'CLIENT';
  const isClient = userRole === 'CLIENT';
  const isAdjuster = userRole === 'ADJUSTER';
  const isAnalyst = userRole === 'ANALYST';
  const isSupervisor = userRole === 'SUPERVISOR';
  const isDirector = userRole === 'DIRECTOR';
  const isAdmin = userRole === 'ADMIN';

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) return;

    setLoading(true);
    setError(null);
    try {
      const user = authService.getStoredUser();
      const clientUser = user?.role === 'CLIENT';

      // Los clientes no consultan métricas corporativas para evitar 403 Forbidden
      const [claimsData, metricsData] = await Promise.all([
        claimsService.getClaims(),
        clientUser ? Promise.resolve(null) : claimsService.getDashboardMetrics().catch(() => null),
      ]);
      setClaims(claimsData);
      setMetrics(metricsData);

      if (selectedClaim) {
        const updated = claimsData.find((c) => c.id === selectedClaim.id);
        if (updated) setSelectedClaim(updated);
      }
    } catch (err: any) {
      console.error('Error al cargar datos de siniestros:', err);
      if (err.message?.includes('401') || err.message?.includes('Token')) {
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
      } else {
        setError(err.message || 'No se pudo conectar con el servidor backend FastAPI.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClaim]);

  useEffect(() => {
    if (isAuthenticated) {
      const user = authService.getStoredUser();
      setCurrentUser(user);
      if (user?.role === 'CLIENT') {
        setActiveTab('client_portal');
      } else if (user?.role === 'ADJUSTER') {
        setActiveTab('claims');
      } else {
        setActiveTab('dashboard');
      }
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    const user = authService.getStoredUser();
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (user?.role === 'CLIENT') {
      setActiveTab('client_portal');
    } else if (user?.role === 'ADJUSTER') {
      setActiveTab('claims');
    } else {
      setActiveTab('dashboard');
    }
    fetchData();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setClaims([]);
    setMetrics(null);
  };

  const handleNavClick = (tab: string) => {
    // Protección de navegación RBAC
    if (isClient && tab !== 'client_portal' && tab !== 'documents') {
      return; // El cliente no puede acceder a módulos internos
    }
    if (isAdjuster && tab !== 'claims' && tab !== 'documents') {
      return; // El perito solo ve siniestros asignados y documentos
    }

    if (tab === 'verify') {
      setIsVerifyPolicyModalOpen(true);
      return;
    }
    if (tab === 'fraud') {
      setStatusFilter('FRAUD_FLAGGED');
      setActiveTab('claims');
      return;
    }
    if (tab === 'payments') {
      setStatusFilter('PENDING_APPROVAL');
      setActiveTab('claims');
      return;
    }
    if (tab === 'documents') {
      if (claims.length > 0) {
        setSelectedClaim(claims[0]);
        setIsDocumentsModalOpen(true);
      }
      return;
    }

    setStatusFilter(null);
    setActiveTab(tab);
  };

  const handleSelectPolicyForClaim = (policyNumber: string) => {
    setPrefilledPolicyNumber(policyNumber);
    setIsNewClaimModalOpen(true);
  };

  const handleSelectClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailModalOpen(true);
  };

  const handleOpenDocumentsForClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDocumentsModalOpen(true);
  };

  const userInitials = (currentUser?.full_name || 'US')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
      
      {/* ============================================================== */}
      {/* 1. BARRA LATERAL IZQUIERDA OSCURA (ESTILO FIGMA + RBAC)         */}
      {/* ============================================================== */}
      <aside 
        style={{ 
          width: '260px', 
          backgroundColor: '#0F1E36', 
          display: 'flex', 
          flexDirection: 'column', 
          flexShrink: 0,
          color: '#E2E8F0',
          borderRight: '1px solid #1E293B',
          zIndex: 40
        }}
      >
        {/* Encabezado Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: isClient ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
            }}>
              <ShieldCheck style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                DineroLi <span style={{ color: '#60A5FA', fontWeight: 600 }}>· UPDS</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>
                {isClient ? 'Portal del Asegurado' : 'Portal Empresarial'}
              </div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}>
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Perfil del Usuario en Barra Lateral */}
        <div style={{ padding: '22px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ position: 'relative', width: '74px', height: '74px', margin: '0 auto 12px' }}>
            <div style={{ 
              width: '74px', height: '74px', borderRadius: '50%', 
              background: isClient ? 'linear-gradient(135deg, #064E3B, #047857)' : 'linear-gradient(135deg, #1E293B, #334155)', 
              border: isClient ? '3px solid #10B981' : '3px solid #2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800,
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
            }}>
              {userInitials}
            </div>
            <span style={{ 
              position: 'absolute', bottom: '2px', right: '4px', 
              width: '14px', height: '14px', borderRadius: '50%', 
              background: '#10B981', border: '2px solid #0F1E36' 
            }} />
          </div>

          <div style={{ 
            fontSize: '0.725rem', fontWeight: 800, 
            color: isClient ? '#34D399' : isAdjuster ? '#FCD34D' : '#EF4444', 
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' 
          }}>
            {currentUser ? getUserRoleLabel(currentUser.role) : 'Usuario'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
            {currentUser?.full_name || 'Usuario'}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: '2px' }}>
            {currentUser?.username ? `@${currentUser.username}` : ''}
          </div>
        </div>

        {/* Menú de Navegación Lateral (Filtrado estricto por Roles RBAC) */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          
          {/* MÓDULO: Portal Asegurado (Visible para Cliente y Administrador) */}
          {(isClient || isAdmin) && (
            <button
              onClick={() => handleNavClick('client_portal')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: activeTab === 'client_portal' ? '#1E3A5F' : 'transparent',
                color: activeTab === 'client_portal' ? '#FFFFFF' : '#94A3B8',
                fontWeight: activeTab === 'client_portal' ? 700 : 500,
                fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <User style={{ width: '18px', height: '18px', color: activeTab === 'client_portal' ? '#60A5FA' : '#94A3B8' }} />
              <span>{isClient ? 'Mi Portal Asegurado' : 'Portal Asegurado (Cliente)'}</span>
            </button>
          )}

          {/* MÓDULO: Dashboard Métricas (Solo Staff: Analista, Supervisor, Director, Admin) */}
          {(isAnalyst || isSupervisor || isDirector || isAdmin) && (
            <button
              onClick={() => handleNavClick('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: activeTab === 'dashboard' ? '#1E3A5F' : 'transparent',
                color: activeTab === 'dashboard' ? '#FFFFFF' : '#94A3B8',
                fontWeight: activeTab === 'dashboard' ? 700 : 500,
                fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard style={{ width: '18px', height: '18px', color: activeTab === 'dashboard' ? '#60A5FA' : '#94A3B8' }} />
              <span>Dashboard Métricas</span>
            </button>
          )}

          {/* MÓDULO: Gestión de Siniestros (Perito, Analista, Supervisor, Director, Admin) */}
          {!isClient && (
            <button
              onClick={() => handleNavClick('claims')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: activeTab === 'claims' ? '#1E3A5F' : 'transparent',
                color: activeTab === 'claims' ? '#FFFFFF' : '#94A3B8',
                fontWeight: activeTab === 'claims' ? 700 : 500,
                fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <FileText style={{ width: '18px', height: '18px', color: activeTab === 'claims' ? '#60A5FA' : '#94A3B8' }} />
              <span>{isAdjuster ? 'Peritajes Asignados' : 'Gestión de Siniestros'}</span>
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '8px 4px' }} />

          {/* MÓDULO: Documentos Digitales (Todos los roles con alcance contextual) */}
          <button
            onClick={() => handleNavClick('documents')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '10px', width: '100%',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              backgroundColor: 'transparent', color: '#94A3B8',
              fontWeight: 500, fontSize: '0.825rem', transition: 'all 0.2s ease'
            }}
          >
            <FolderCheck style={{ width: '18px', height: '18px' }} />
            <span>{isClient ? 'Mis Documentos de Siniestro' : 'Documentos Digitales'}</span>
          </button>

          {/* MÓDULO: Verificar Póliza (Analistas, Supervisores, Directores, Admin) */}
          {(isAnalyst || isSupervisor || isDirector || isAdmin) && (
            <button
              onClick={() => handleNavClick('verify')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: 'transparent', color: '#94A3B8',
                fontWeight: 500, fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <Search style={{ width: '18px', height: '18px' }} />
              <span>Verificar Póliza</span>
            </button>
          )}

          {/* MÓDULO: Anti-Fraude (Analistas, Supervisores, Directores, Admin) */}
          {(isAnalyst || isSupervisor || isDirector || isAdmin) && (
            <button
              onClick={() => handleNavClick('fraud')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: 'transparent', color: '#94A3B8',
                fontWeight: 500, fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <ShieldAlert style={{ width: '18px', height: '18px', color: '#F87171' }} />
              <span>Control Anti-Fraude</span>
            </button>
          )}

          {/* MÓDULO: Autorizaciones de Pago (Supervisores, Directores, Admin) */}
          {(isSupervisor || isDirector || isAdmin) && (
            <button
              onClick={() => handleNavClick('payments')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', width: '100%',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                backgroundColor: 'transparent', color: '#94A3B8',
                fontWeight: 500, fontSize: '0.825rem', transition: 'all 0.2s ease'
              }}
            >
              <DollarSign style={{ width: '18px', height: '18px', color: '#FBBF24' }} />
              <span>Autorizaciones de Pago</span>
            </button>
          )}
        </nav>

        {/* Botón Salir */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '10px 16px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            <span>Cerrar Sesión</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', fontSize: '0.65rem', color: '#64748B' }}>
            <span>Ayuda</span>
            <span>·</span>
            <span>Privacidad</span>
            <span>·</span>
            <span>Condiciones</span>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. ÁREA PRINCIPAL CON ONDA AZUL SUPERIOR (ESTILO FIGMA)         */}
      {/* ============================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Cabecera con Onda Azul de Figma */}
        <header 
          style={{ 
            position: 'relative', 
            height: '190px', 
            background: isClient 
              ? 'linear-gradient(135deg, #064E3B 0%, #0F5132 45%, #10B981 100%)' 
              : 'linear-gradient(135deg, #0A1C3E 0%, #11346C 45%, #1D5BB6 100%)',
            padding: '24px 36px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}
        >
          {/* Barra de Herramientas Superior */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: isClient ? '#A7F3D0' : '#93C5FD', textTransform: 'uppercase' }}>
                {isClient ? 'Portal Asegurado DineroLi' : 'Sistema Corporativo UPDS'}
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                {isClient 
                  ? 'Seguimiento y Liquidación de Siniestros' 
                  : isAdjuster 
                  ? 'Módulo de Peritaje Técnico e Inspección'
                  : 'Portal Empresarial de Gestión de Siniestros'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Badge de Rol */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' 
              }}>
                <span>ROL: {currentUser ? getUserRoleLabel(currentUser.role) : 'Usuario'}</span>
              </div>

              {/* Idioma Español */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                backgroundColor: 'rgba(255,255,255,0.12)', padding: '6px 12px', 
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' 
              }}>
                <span>🇪🇸 ES</span>
              </div>

              {/* Estado Servidor Backend */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', 
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#A7F3D0' 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span>FastAPI En Línea</span>
              </div>

              {/* Botón Sincronizar */}
              <button 
                onClick={fetchData} 
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                  padding: '7px 14px', borderRadius: '20px', color: '#FFFFFF',
                  fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <RefreshCw style={{ width: '13px', height: '13px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Sincronizar</span>
              </button>

              {/* Notificaciones */}
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' 
              }}>
                <Bell style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
                <span style={{ 
                  position: 'absolute', top: '3px', right: '3px', 
                  width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' 
                }} />
              </div>
            </div>
          </div>

          {/* SVG Onda inferior exacta de Figma */}
          <svg 
            viewBox="0 0 1440 90" 
            preserveAspectRatio="none" 
            style={{ 
              position: 'absolute', bottom: 0, left: 0, 
              width: '100%', height: '55px', zIndex: 1 
            }}
          >
            <path 
              fill="#F0F4F8" 
              d="M0,32L48,42.7C96,53,192,75,288,74.7C384,75,480,53,576,42.7C672,32,768,32,864,42.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z"
            />
          </svg>
        </header>

        {/* Contenedor Flotante de Contenido */}
        <div style={{ padding: '0 32px 40px 32px', marginTop: '-60px', zIndex: 20 }}>
          
          {/* Mensaje de Error si ocurre */}
          {error && (
            <div 
              style={{ 
                padding: '16px 20px', marginBottom: '20px', borderRadius: '12px', 
                background: '#FEF2F2', border: '1px solid #F87171',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle style={{ width: '22px', height: '22px', color: '#DC2626', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                    Aviso del Sistema
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#B91C1C', margin: '2px 0 0 0' }}>
                    {error}
                  </p>
                </div>
              </div>
              <button 
                onClick={fetchData} 
                style={{ 
                  backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', 
                  padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', 
                  fontWeight: 600, cursor: 'pointer' 
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* CUADRÍCULA FIGMA: TARJETA DE PERFIL (IZQ) + ÁREA DE TRABAJO (DER) */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* -------------------------------------------------------- */}
            {/* TARJETA DE INFORMACIÓN DE PERFIL ADAPTADA POR ROL        */}
            {/* -------------------------------------------------------- */}
            <div 
              style={{ 
                width: '280px', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)', 
                border: '1px solid #E2E8F0',
                padding: '24px 20px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Foto de Perfil Central */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '90px', height: '90px', borderRadius: '50%', 
                  backgroundColor: '#E2E8F0', border: '4px solid #FFFFFF',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  margin: '0 auto 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', fontWeight: 800,
                  color: isClient ? '#065F46' : '#1E3A8A',
                  background: isClient 
                    ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' 
                    : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
                }}>
                  {userInitials}
                </div>

                <div style={{ 
                  fontSize: '0.85rem', fontWeight: 800, 
                  color: isClient ? '#059669' : isAdjuster ? '#D97706' : '#DC2626', 
                  letterSpacing: '0.02em', textTransform: 'uppercase' 
                }}>
                  {currentUser ? getUserRoleLabel(currentUser.role) : 'Usuario'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {currentUser?.full_name || 'Usuario'}
                </div>
                <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                  {currentUser?.username ? `@${currentUser.username}` : ''}
                </div>
              </div>

              {/* Recuadro de Información Contextual por Rol (Figma) */}
              <div style={{ 
                backgroundColor: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isClient ? 'Datos del Asegurado' : 'Información Operativa'}
                </div>

                {isClient ? (
                  <>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Tipo de Cuenta</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        Asegurado Titular Verificado
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Póliza Principal</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                        POL-2026-8801
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Cobertura Activa</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                        Auto Todo Riesgo ($35,000 USD)
                      </div>
                    </div>
                  </>
                ) : isAdjuster ? (
                  <>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Especialidad Técnica</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        Peritaje Automotriz & Avalúos
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Mesa Asignada</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                        Inspecciones en Terreno
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Entidad</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                        UPDS Seguros & Reaseguros
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Líder Inmediato</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                        {isDirector ? 'Consejo de Administración' : isSupervisor ? 'Lic. Elena Ramos' : 'Dra. Sonia González'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Límite de Aprobación</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                        {isAnalyst ? 'Hasta $5,000 USD' : isSupervisor ? 'Hasta $25,000 USD' : 'Ilimitado (> $25,000 USD)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>Entidad / Cliente</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                        DineroLi · UPDS
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Pestañas de Navegación Verticales (Figma) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <button
                  onClick={() => setActiveSubTab('general')}
                  style={{
                    padding: '9px 14px', borderRadius: '8px', border: 'none',
                    textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: activeSubTab === 'general' ? '#1E3A5F' : '#F1F5F9',
                    color: activeSubTab === 'general' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isClient ? 'Mis Siniestros' : 'Vista Principal'}
                </button>
                <button
                  onClick={() => setActiveSubTab('bitacora')}
                  style={{
                    padding: '9px 14px', borderRadius: '8px', border: 'none',
                    textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: activeSubTab === 'bitacora' ? '#1E3A5F' : '#F1F5F9',
                    color: activeSubTab === 'bitacora' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isClient ? 'Historial de Eventos' : 'Bitácora de Auditoría'}
                </button>
                <button
                  onClick={() => setActiveSubTab('notificaciones')}
                  style={{
                    padding: '9px 14px', borderRadius: '8px', border: 'none',
                    textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: activeSubTab === 'notificaciones' ? '#1E3A5F' : '#F1F5F9',
                    color: activeSubTab === 'notificaciones' ? '#FFFFFF' : '#475569',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span>Notificaciones</span>
                  <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem' }}>
                    {claims.length}
                  </span>
                </button>
              </div>

              {/* Botón Acción Rápida: Reportar Siniestro */}
              <button
                onClick={() => {
                  setPrefilledPolicyNumber(isClient ? 'POL-2026-8801' : '');
                  setIsNewClaimModalOpen(true);
                }}
                style={{
                  backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none',
                  padding: '11px', borderRadius: '10px', fontWeight: 700,
                  fontSize: '0.825rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)', marginTop: '4px'
                }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} />
                <span>Reportar Nuevo Siniestro</span>
              </button>
            </div>

            {/* -------------------------------------------------------- */}
            {/* ÁREA DE CONTENIDO PRINCIPAL (CONTROLADA POR ROLES)       */}
            {/* -------------------------------------------------------- */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Barra Superior Horizontal de Pestañas y Búsqueda */}
              <div 
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '14px', 
                  padding: '14px 22px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid #E2E8F0',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                {/* Selector de Módulos permitido para el Rol */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {isClient ? (
                    <button
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        fontSize: '0.825rem', fontWeight: 700, cursor: 'default',
                        backgroundColor: '#064E3B', color: '#FFFFFF'
                      }}
                    >
                      Portal de Auto-Atención al Asegurado
                    </button>
                  ) : (
                    <>
                      {!isAdjuster && (
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: activeTab === 'dashboard' ? '#0F1E36' : '#F1F5F9',
                            color: activeTab === 'dashboard' ? '#FFFFFF' : '#475569',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Dashboard General
                        </button>
                      )}

                      <button
                        onClick={() => handleNavClick('claims')}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', border: 'none',
                          fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer',
                          backgroundColor: activeTab === 'claims' ? '#0F1E36' : '#F1F5F9',
                          color: activeTab === 'claims' ? '#FFFFFF' : '#475569',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isAdjuster ? `Siniestros Asignados (${claims.length})` : `Expedientes de Siniestros (${claims.length})`}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNavClick('client_portal')}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: activeTab === 'client_portal' ? '#0F1E36' : '#F1F5F9',
                            color: activeTab === 'client_portal' ? '#FFFFFF' : '#475569',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Vista Asegurado (Modo Admin)
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Buscador de Siniestros */}
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '10px', width: '15px', height: '15px', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Búsqueda rápida en el sistema..."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px 8px 36px',
                      borderRadius: '8px', border: '1px solid #CBD5E1',
                      fontSize: '0.8rem', backgroundColor: '#F8FAFC',
                      color: '#0F172A', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Sub-Vista: Bitácora */}
              {activeSubTab === 'bitacora' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {isClient ? 'Historial de Avance de sus Siniestros' : 'Bitácora de Auditoría y Eventos'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '20px' }}>
                    {isClient 
                      ? 'Registro cronológico de peritajes y dictámenes para sus reclamaciones registradas.' 
                      : 'Historial cronológico de cambios de estado, asignaciones de peritos y liquidaciones.'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {claims.map((c) => (
                      <div key={c.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                            Expediente {c.claim_number} — Póliza: {c.policy_number}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                            Estado actual: {c.status} | Fecha incidente: {c.incident_date}
                          </div>
                        </div>
                        <button onClick={() => handleSelectClaim(c)} style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          Ver Detalle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Vista: Notificaciones */}
              {activeSubTab === 'notificaciones' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Centro de Notificaciones y Avisos
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '16px' }}>
                    Comunicaciones automáticas del sistema según su perfil de usuario.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', fontSize: '0.825rem', fontWeight: 600 }}>
                      ℹ️ Sesión iniciada con éxito bajo el rol {currentUser ? getUserRoleLabel(currentUser.role) : 'Usuario'}.
                    </div>
                    {isClient && (
                      <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.825rem', fontWeight: 600 }}>
                        ✅ Su póliza POL-2026-8801 se encuentra al día y en cobertura completa.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VISTAS PRINCIPALES DEL SISTEMA */}
              {activeSubTab === 'general' && (
                <>
                  {isClient ? (
                    /* CLIENTE: Solo tiene acceso a su Portal de Asegurado */
                    <ClientPortal
                      claims={claims}
                      onRefresh={fetchData}
                      onOpenDocuments={handleOpenDocumentsForClaim}
                      currentUser={currentUser}
                    />
                  ) : (
                    /* PERSONAL INTERNO: Vistas operativas y analíticas */
                    <>
                      {activeTab === 'client_portal' && isAdmin && (
                        <ClientPortal
                          claims={claims}
                          onRefresh={fetchData}
                          onOpenDocuments={handleOpenDocumentsForClaim}
                          currentUser={currentUser}
                        />
                      )}

                      {activeTab === 'policies' && (
                        <PoliciesList onRefresh={fetchData} />
                      )}

                      {activeTab === 'dashboard' && !isAdjuster && (
                        <Dashboard
                          metrics={metrics}
                          onOpenNewClaimModal={() => {
                            setPrefilledPolicyNumber('');
                            setIsNewClaimModalOpen(true);
                          }}
                          onOpenVerifyPolicyModal={() => setIsVerifyPolicyModalOpen(true)}
                          onFilterStatus={(st) => {
                            setStatusFilter(st);
                            setActiveTab('claims');
                          }}
                          activeStatusFilter={statusFilter}
                        />
                      )}

                      {(activeTab === 'claims' || isAdjuster) && (
                        <ClaimsList
                          claims={claims}
                          onSelectClaim={handleSelectClaim}
                          statusFilter={statusFilter}
                          onFilterChange={setStatusFilter}
                        />
                      )}
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODALES DE SISTEMA                                          */}
      {/* ============================================================== */}
      <PolicyVerificationModal
        isOpen={isVerifyPolicyModalOpen}
        onClose={() => setIsVerifyPolicyModalOpen(false)}
        onSelectPolicyForClaim={handleSelectPolicyForClaim}
      />

      <ClaimRegistrationModal
        isOpen={isNewClaimModalOpen}
        onClose={() => setIsNewClaimModalOpen(false)}
        prefilledPolicyNumber={prefilledPolicyNumber}
        onSuccess={fetchData}
      />

      <ClaimDetailModal
        claim={selectedClaim}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClaim(null);
        }}
        onRefresh={fetchData}
        onOpenDocuments={() => {
          setIsDetailModalOpen(false);
          setIsDocumentsModalOpen(true);
        }}
        currentUserRole={currentUser?.role}
      />

      <DocumentsModal
        claim={selectedClaim || (claims.length > 0 ? claims[0] : null)}
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        onRefresh={fetchData}
      />

      <AuthModal
        isOpen={!isAuthenticated}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;