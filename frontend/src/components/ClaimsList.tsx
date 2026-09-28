import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import type { Claim } from '../types/claims';
import { getClaimStatusLabel, getClaimStatusBadgeClass, getFraudRiskLabel } from '../utils/formatters';

interface ClaimsListProps {
  claims: Claim[];
  onSelectClaim: (claim: Claim) => void;
  statusFilter: string | null;
  onFilterChange: (status: string | null) => void;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({
  claims,
  onSelectClaim,
  statusFilter,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClaims = claims.filter((c) => {
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesSearch = 
      c.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incident_description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
            Registro de Siniestros y Reclamos
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
            Listado consolidador del estado operacional de reclamos (RF-03, RF-11)
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', padding: '7px 12px 7px 32px', fontSize: '0.8rem' }}
              placeholder="Buscar siniestro o póliza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => onFilterChange(null)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', background: statusFilter === null ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.04)' }}
            >
              Todos ({claims.length})
            </button>
            <button
              onClick={() => onFilterChange('FRAUD_FLAGGED')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#FCA5A5', background: statusFilter === 'FRAUD_FLAGGED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)' }}
            >
              Sospecha Fraude
            </button>
            <button
              onClick={() => onFilterChange('PENDING_APPROVAL')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#FCD34D', background: statusFilter === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)' }}
            >
              Pend. Aprobación
            </button>
            <button
              onClick={() => onFilterChange('LIQUIDATED')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#6EE7B7', background: statusFilter === 'LIQUIDATED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)' }}
            >
              Liquidados
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nº Siniestro</th>
              <th>Número Póliza</th>
              <th>Fecha Evento</th>
              <th>Monto Reclamado</th>
              <th>Estado Actual</th>
              <th>Riesgo Fraude</th>
              <th>Acción Operativa</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                  No se encontraron registros de siniestros con el criterio de búsqueda especificado.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>
                    <strong style={{ color: '#F8FAFC' }}>{claim.claim_number}</strong>
                  </td>
                  <td>
                    <span style={{ color: '#94A3B8' }}>{claim.policy_number}</span>
                  </td>
                  <td>{claim.incident_date}</td>
                  <td>
                    <strong style={{ color: '#818CF8' }}>
                      ${claim.claimed_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${getClaimStatusBadgeClass(claim.status)}`}>
                      {getClaimStatusLabel(claim.status)}
                    </span>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: claim.fraud_risk_level === 'CRITICAL' ? '#EF4444' : claim.fraud_risk_level === 'HIGH' ? '#F97316' : claim.fraud_risk_level === 'MEDIUM' ? '#FBBF24' : '#34D399' 
                      }}
                    >
                      {getFraudRiskLabel(claim.fraud_risk_level)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onSelectClaim(claim)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                    >
                      <Eye style={{ width: '14px', height: '14px' }} />
                      <span>Procesar</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
