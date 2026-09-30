import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, PlusCircle, X, AlertCircle, 
  CheckCircle2, DollarSign, Calendar, User, CreditCard, Filter
} from 'lucide-react';
import type { Policy, PolicyType, PolicyStatus } from '../types/claims';
import { claimsService } from '../services/claimsService';
import { getPolicyStatusLabel, getPolicyTypeLabel, formatCurrency } from '../utils/formatters';

interface PoliciesListProps {
  onRefresh: () => void;
}

export const PoliciesList: React.FC<PoliciesListProps> = ({ onRefresh }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for New Policy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyNumber, setPolicyNumber] = useState('');
  const [insuredName, setInsuredName] = useState('');
  const [insuredDocument, setInsuredDocument] = useState('');
  const [policyType, setPolicyType] = useState<PolicyType>('AUTO');
  const [coverageAmount, setCoverageAmount] = useState<number | ''>(25000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<PolicyStatus>('ACTIVE');
  const [bankAccount, setBankAccount] = useState('CTA-BNC-88019482');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await claimsService.getPolicies();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las pólizas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insuredName.trim() || !insuredDocument.trim() || !coverageAmount || !startDate || !endDate) {
      setFormError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const newPol = await claimsService.createPolicy({
        policy_number: policyNumber.trim() || undefined,
        insured_name: insuredName.trim(),
        insured_document: insuredDocument.trim(),
        policy_type: policyType,
        coverage_amount: Number(coverageAmount),
        start_date: startDate,
        end_date: endDate,
        status: status,
        bank_account_number: bankAccount.trim() || 'CTA-BNC-88019482',
      });

      setSuccessMsg(`¡Póliza #${newPol.policy_number} emitida y registrada exitosamente!`);
      setIsModalOpen(false);
      // Reset form
      setPolicyNumber('');
      setInsuredName('');
      setInsuredDocument('');
      setCoverageAmount(25000);
      fetchPolicies();
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Error al registrar la póliza.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = 
      p.policy_number.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.insured_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.insured_document.toLowerCase().includes(searchQuery.toLowerCase().trim());
    
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.65)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ width: '24px', height: '24px', color: '#2563EB' }} />
            Gestión Centralizada de Pólizas de Seguro
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
            Consola administrativa para alta, consulta y control de pólizas activas y cobertura.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ padding: '10px 20px' }}
        >
          <PlusCircle style={{ width: '18px', height: '18px' }} />
          <span>Registrar Nueva Póliza</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#64748B' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Buscar por Nº de Póliza, Nombre del Asegurado o Cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter style={{ width: '16px', height: '16px', color: '#64748B' }} />
          <select 
            className="form-input"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="EXPIRED">Vencidas</option>
            <option value="SUSPENDED">Suspendidas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Policies Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Cargando catálogo de pólizas...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', borderRadius: '10px' }}>{error}</div>
      ) : filteredPolicies.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
          No se encontraron pólizas registradas que coincidan con la búsqueda.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="claims-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nº Póliza</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Asegurado / Cédula</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ramo</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cobertura USD</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Vigencia</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cuenta Bancaria</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#60A5FA' }}>
                    {p.policy_number}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{p.insured_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Doc: {p.insured_document}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#E2E8F0' }}>
                    {getPolicyTypeLabel(p.policy_type)}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#34D399' }}>
                    {formatCurrency(p.coverage_amount)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.775rem', color: '#CBD5E1' }}>
                    <div>{p.start_date} al</div>
                    <div style={{ color: '#94A3B8' }}>{p.end_date}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.775rem', color: '#60A5FA', fontFamily: 'monospace' }}>
                    {p.bank_account_number || 'CTA-BNC-88019482'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-approved' : 'badge-fraud'}`}>
                      {getPolicyStatusLabel(p.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVA PÓLIZA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle style={{ width: '22px', height: '22px', color: '#2563EB' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>Emisión y Registro de Nueva Póliza</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {formError && (
              <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Número de Póliza (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: POL-2026-9901 (Automático si está vacío)"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Ramo / Tipo de Seguro *</label>
                  <select
                    className="form-input"
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as PolicyType)}
                  >
                    <option value="AUTO">Automotor (AUTO)</option>
                    <option value="HOME">Hogar / Vivienda (HOME)</option>
                    <option value="COMMERCIAL">Comercial / Empresa (COMMERCIAL)</option>
                    <option value="HEALTH">Salud / Médica (HEALTH)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Nombre Completo del Asegurado *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Juan Carlos Pérez"
                    value={insuredName}
                    onChange={(e) => setInsuredName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Documento de Identidad (Cédula/CI) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 1712345678"
                    value={insuredDocument}
                    onChange={(e) => setInsuredDocument(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Monto de Cobertura ($ USD) *</label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    className="form-input"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Estado Inicial de la Póliza *</label>
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PolicyStatus)}
                  >
                    <option value="ACTIVE">Activa (ACTIVE)</option>
                    <option value="EXPIRED">Vencida (EXPIRED)</option>
                    <option value="SUSPENDED">Suspendida (SUSPENDED)</option>
                    <option value="CANCELLED">Cancelada (CANCELLED)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Fecha Inicio Vigencia *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Fecha Fin Vigencia *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Número de Cuenta Bancaria Asociada *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: CTA-BNC-88019482"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <span>{saving ? 'Guardando...' : 'Guardar y Emitir Póliza'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
