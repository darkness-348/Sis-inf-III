import React from 'react';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: '48px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '32px', paddingBottom: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#236AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(35, 106, 255, 0.3)'
            }}>
              <Shield style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC' }}>
              DineroLi <span style={{ color: '#236AFF' }}>· Siniestros</span>
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '280px' }}>
            Tu compañero financiero y de siniestros en todo momento. Gestión integral de pólizas, peritajes y liquidación transparente.
          </p>
        </div>

        {/* Col 2: Features */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Módulos y Funcionalidades
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
            <li>Seguimiento de Gastos y Presupuestos</li>
            <li>Inspección Pericial & Daños (RF-04)</li>
            <li>Análisis de Fraude Automatizado (RF-06)</li>
            <li>Autorizaciones & Pagos Bancarios (RF-08)</li>
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Contacto y Soporte
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail style={{ width: '14px', height: '14px', color: '#6597FF' }} />
              <span>info@segurosupds.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone style={{ width: '14px', height: '14px', color: '#6597FF' }} />
              <span>+591 4 6440000 / 800-10-7777</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: '14px', height: '14px', color: '#6597FF' }} />
              <span>Campus UPDS · Sucre, Bolivia</span>
            </div>
          </div>
        </div>

        {/* Col 4: Quality & Trust */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Confianza y Seguridad
          </h4>
          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#236AFF' }}>95%</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F8FAFC', marginTop: '2px' }}>Satisfacción del Cliente</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Respaldado por arquitectura limpia con FastAPI y PostgreSQL.</div>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.75rem', color: '#64748B' }}>
        <div>
          © 2026 by DineroLi · Seguros UPDS. Potenciado y protegido con Arquitectura Limpia.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Política de Privacidad</span>
          <span>Términos del Servicio</span>
          <span>Declaración de Accesibilidad</span>
        </div>
      </div>
    </footer>
  );
};