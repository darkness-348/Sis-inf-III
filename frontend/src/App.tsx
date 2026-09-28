import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ClaimsList } from './components/ClaimsList';
import { ClientPortal } from './components/ClientPortal';
import { PolicyVerificationModal } from './components/PolicyVerificationModal';
import { ClaimRegistrationModal } from './components/ClaimRegistrationModal';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { DocumentsModal } from './components/DocumentsModal';
import { AuthModal } from './components/AuthModal';
import { claimsService } from './services/claimsService';
import { authService } from './services/authService';
import type { Claim, DashboardMetrics } from './types/claims';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getStoredUser());

  const [claims, setClaims] = useState<Claim[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation tab (defaults to client_portal if CLIENT role, else client_portal)
  const [activeTab, setActiveTab] = useState<string>('client_portal');

  // Modals state
  const [isVerifyPolicyModalOpen, setIsVerifyPolicyModalOpen] = useState(false);
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [prefilledPolicyNumber, setPrefilledPolicyNumber] = useState('');
  
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) return;

    setLoading(true);
    setError(null);
    try {
      const [claimsData, metricsData] = await Promise.all([
        claimsService.getClaims(),
        claimsService.getDashboardMetrics(),
      ]);
      setClaims(claimsData);
      setMetrics(metricsData);
      
      // Update selected claim if open
      if (selectedClaim) {
        const updated = claimsData.find((c) => c.id === selectedClaim.id);
        if (updated) setSelectedClaim(updated);
      }
    } catch (err: any) {
      console.error('Error fetching claims data:', err);
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
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setClaims([]);
    setMetrics(null);
  };

  const isClient = currentUser?.role === 'CLIENT';

  const handleTabChange = (tab: string) => {
    if (isClient) {
      if (tab === 'client_portal_report') {
        setActiveTab('client_portal_report');
      } else {
        setActiveTab('client_portal');
      }
      return;
    }

    setActiveTab(tab);
    if (tab === 'verify') {
      setIsVerifyPolicyModalOpen(true);
    } else if (tab === 'fraud') {
      setStatusFilter('FRAUD_FLAGGED');
    } else if (tab === 'payments') {
      setStatusFilter('PENDING_APPROVAL');
    } else if (tab === 'documents') {
      if (claims.length > 0) {
        setSelectedClaim(claims[0]);
        setIsDocumentsModalOpen(true);
      }
    } else if (tab === 'dashboard' || tab === 'claims' || tab === 'client_portal') {
      setStatusFilter(null);
    }
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

  return (
    <div style={{ minHeight: '100vh', padding: '0 24px 40px 24px' }}>
      <Navbar 
        onRefresh={fetchData} 
        loading={loading} 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {error && (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px 24px', 
              marginBottom: '20px', 
              borderRadius: '12px', 
              background: 'rgba(239, 68, 68, 0.12)', 
              borderColor: 'rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <AlertCircle style={{ width: '24px', height: '24px', color: '#EF4444', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FCA5A5' }}>
                  No se pudo conectar con el servidor backend
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                  Detalle: {error} — Asegúrese de que el servidor FastAPI esté iniciado en <code>http://127.0.0.1:8000</code>.
                </p>
              </div>
            </div>
            <button onClick={fetchData} className="btn-primary" style={{ background: '#DC2626', whiteSpace: 'nowrap' }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Reintentar Conexión</span>
            </button>
          </div>
        )}

        {isClient ? (
          <ClientPortal
            claims={claims}
            onRefresh={fetchData}
            onOpenDocuments={handleOpenDocumentsForClaim}
            currentUser={currentUser}
            initialSubTab={activeTab === 'client_portal_report' ? 'report' : 'track'}
          />
        ) : (
          <>
            {activeTab === 'client_portal' && (
              <ClientPortal
                claims={claims}
                onRefresh={fetchData}
                onOpenDocuments={handleOpenDocumentsForClaim}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'dashboard' && (
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

            {activeTab !== 'client_portal' && (
              <ClaimsList
                claims={claims}
                onSelectClaim={handleSelectClaim}
                statusFilter={statusFilter}
                onFilterChange={setStatusFilter}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
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
