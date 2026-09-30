import React, { useState } from 'react';
import { FileCheck, X, Upload, CheckCircle, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import type { Claim } from '../types/claims';

interface DocumentsModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export type DocValidationStatus = 'VALIDATED' | 'PENDING' | 'REJECTED';

interface AttachedDoc {
  id: string;
  name: string;
  sizeKb: number;
  format: string;
  uploadDate: string;
  validationStatus: DocValidationStatus;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  const [docs, setDocs] = useState<AttachedDoc[]>([
    { id: '1', name: 'Informe_Policial_Accidente.pdf', sizeKb: 1024, format: 'PDF', uploadDate: '2026-09-21', validationStatus: 'VALIDATED' },
    { id: '2', name: 'Fotografias_Danio_Vehiculo.jpg', sizeKb: 2048, format: 'JPG', uploadDate: '2026-09-21', validationStatus: 'VALIDATED' },
    { id: '3', name: 'Factura_Taller_Reparacion.pdf', sizeKb: 1540, format: 'PDF', uploadDate: '2026-09-22', validationStatus: 'PENDING' },
  ]);

  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSizeKb, setFileSizeKb] = useState<number>(1500);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  if (!isOpen || !claim) return null;

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    // Validation: format PDF, JPG, PNG, DOCX and max size 5000 KB (5MB)
    const validFormats = ['PDF', 'JPG', 'PNG', 'DOCX'];
    const isFormatValid = validFormats.includes(fileFormat.toUpperCase());
    const isSizeValid = fileSizeKb <= 5000;

    const initialStatus: DocValidationStatus = (isFormatValid && isSizeValid) ? 'VALIDATED' : 'REJECTED';

    const newDoc: AttachedDoc = {
      id: Date.now().toString(),
      name: fileName.trim(),
      sizeKb: fileSizeKb,
      format: fileFormat.toUpperCase(),
      uploadDate: new Date().toISOString().split('T')[0],
      validationStatus: initialStatus,
    };

    setDocs([...docs, newDoc]);
    setFileName('');

    if (!isFormatValid || !isSizeValid) {
      setNotificationMsg('Archivo observado: Formato no permitido o tamaño superior al límite de 5 MB (se registró como RECHAZADO).');
    } else {
      setNotificationMsg('Documento adjuntado y validado correctamente.');
    }
  };

  const handleUpdateStatus = (id: string, newStatus: DocValidationStatus) => {
    setDocs(docs.map(d => d.id === id ? { ...d, validationStatus: newStatus } : d));
    const targetDoc = docs.find(d => d.id === id);
    const statusLabels: Record<DocValidationStatus, string> = {
      VALIDATED: 'VALIDADO',
      PENDING: 'EN REVISIÓN',
      REJECTED: 'RECHAZADO',
    };
    setNotificationMsg(`Estado del documento '${targetDoc?.name || id}' actualizado a ${statusLabels[newStatus]}.`);
  };

  const handleRemoveDoc = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
  };

  const handleMarkIncomplete = () => {
    setIsIncomplete(true);
    setNotificationMsg(`Notificación enviada al asegurado: La documentación para el siniestro #${claim.claim_number} se encuentra INCOMPLETA. Se ha fijado un plazo de 5 días hábiles para regularización.`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck style={{ width: '22px', height: '22px', color: '#2563EB' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>Gestión de Documentación y Validación (RF-02 / RF-08)</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Siniestro #{claim.claim_number} | Póliza: {claim.policy_number}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {notificationMsg && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', background: isIncomplete ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.15)', border: isIncomplete ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)', color: isIncomplete ? '#FCD34D' : '#93C5FD', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Form: Upload Doc */}
        <form onSubmit={handleAddDocument} style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
            Adjuntar Nuevo Documento Requerido
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="form-label">Nombre del Documento</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Cedula_Identidad.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Formato</label>
              <select className="form-input" value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
                <option value="DOCX">DOCX</option>
                <option value="EXE">EXE (No permitido)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tamaño (KB)</label>
              <input
                type="number"
                className="form-input"
                value={fileSizeKb}
                onChange={(e) => setFileSizeKb(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
            Validar & Adjuntar Documento
          </button>
        </form>

        {/* Document List */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '12px' }}>Documentos Anexados y Estado de Validación</h4>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Documento</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Formato</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Tamaño</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Estado Validación</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#CBD5E1' }}>{d.format}</td>
                  <td style={{ padding: '12px 14px', color: '#CBD5E1' }}>{(d.sizeKb / 1024).toFixed(2)} MB</td>
                  <td style={{ padding: '12px 14px' }}>
                    {/* Interactive Dropdown Selector to change validation status */}
                    <select
                      value={d.validationStatus}
                      onChange={(e) => handleUpdateStatus(d.id, e.target.value as DocValidationStatus)}
                      className="form-input"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        background: d.validationStatus === 'VALIDATED' 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : d.validationStatus === 'REJECTED' 
                          ? 'rgba(239, 68, 68, 0.2)' 
                          : 'rgba(245, 158, 11, 0.2)',
                        color: d.validationStatus === 'VALIDATED' 
                          ? '#34D399' 
                          : d.validationStatus === 'REJECTED' 
                          ? '#FCA5A5' 
                          : '#FCD34D',
                        border: d.validationStatus === 'VALIDATED' 
                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                          : d.validationStatus === 'REJECTED' 
                          ? '1px solid rgba(239, 68, 68, 0.4)' 
                          : '1px solid rgba(245, 158, 11, 0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="VALIDATED" style={{ background: '#0F172A', color: '#34D399' }}>✅ VALIDADO</option>
                      <option value="PENDING" style={{ background: '#0F172A', color: '#FCD34D' }}>⚠️ EN REVISIÓN</option>
                      <option value="REJECTED" style={{ background: '#0F172A', color: '#FCA5A5' }}>❌ RECHAZADO</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <button onClick={() => handleRemoveDoc(d.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Eliminar documento">
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RF-08 Action */}
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FCD34D' }}>Notificación de Documentación Incompleta (RF-08)</h4>
            <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>Marcar y enviar alerta formal al asegurado cuando falten requisitos obligatorios.</p>
          </div>
          <button onClick={handleMarkIncomplete} className="btn-secondary" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FCD34D' }}>
            Marcar Incompleto & Notificar
          </button>
        </div>

      </div>
    </div>
  );
};
