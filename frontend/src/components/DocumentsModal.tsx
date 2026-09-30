import React, { useState } from 'react';
import { FileCheck, X, Upload, CheckCircle, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import type { Claim } from '../types/claims';

interface DocumentsModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface AttachedDoc {
  id: string;
  name: string;
  sizeKb: number;
  format: string;
  uploadDate: string;
  isValid: boolean;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  const [docs, setDocs] = useState<AttachedDoc[]>([
    { id: '1', name: 'Informe_Policial_Accidente.pdf', sizeKb: 1024, format: 'PDF', uploadDate: '2026-09-21', isValid: true },
    { id: '2', name: 'Fotografias_Danio_Vehiculo.jpg', sizeKb: 2048, format: 'JPG', uploadDate: '2026-09-21', isValid: true },
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

    // Validation: format PDF, JPG, PNG and max size 5000 KB (5MB)
    const validFormats = ['PDF', 'JPG', 'PNG', 'DOCX'];
    const isFormatValid = validFormats.includes(fileFormat.toUpperCase());
    const isSizeValid = fileSizeKb <= 5000;

    const newDoc: AttachedDoc = {
      id: Date.now().toString(),
      name: fileName.trim(),
      sizeKb: fileSizeKb,
      format: fileFormat.toUpperCase(),
      uploadDate: new Date().toISOString().split('T')[0],
      isValid: isFormatValid && isSizeValid,
    };

    setDocs([...docs, newDoc]);
    setFileName('');

    if (!isFormatValid || !isSizeValid) {
      setNotificationMsg('Archivo rechazado: Formato no permitido o tamaño superior alímite de 5 MB.');
    } else {
      setNotificationMsg('Documento adjuntado y validado correctamente.');
    }
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck style={{ width: '22px', height: '22px', color: '#2563EB' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>Gestión de Documentación (RF-02 / RF-08)</h3>
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
                <option value="EXE">EXE (No permitido)</option>
              </select>
            </div>
            <div>
              <label className="form-label">tamaño (KB)</label>
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
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '12px' }}>Documentos Anexados</h4>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Formato</th>
                <th>tamaño</th>
                <th>Estado Validación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.format}</td>
                  <td>{(d.sizeKb / 1024).toFixed(2)} MB</td>
                  <td>
                    {d.isValid ? (
                      <span style={{ color: '#34D399', fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle style={{ width: '14px', height: '14px' }} />
                        VALIDADO
                      </span>
                    ) : (
                      <span style={{ color: '#FCA5A5', fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle style={{ width: '14px', height: '14px' }} />
                        NO VÁLIDO
                      </span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleRemoveDoc(d.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
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
