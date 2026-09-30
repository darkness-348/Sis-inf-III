import React, { useState } from 'react';
import { Lock, User, Mail, UserPlus, LogIn, AlertCircle, CheckCircle, Eye, EyeOff, Shield, Building2, Star, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import type { UserRole } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async (user: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ username: user, password: pass });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con usuario demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        if (!username || !password) { setError('Por favor ingrese usuario y contraseña.'); setLoading(false); return; }
        await authService.login({ username: username.trim(), password });
        onSuccess();
      } else {
        if (!username || !password || !email || !fullName) { setError('Por favor complete todos los campos requeridos.'); setLoading(false); return; }
        await authService.register({ username: username.trim(), email: email.trim(), password, full_name: fullName.trim(), role });
        setSuccessMsg('Usuario registrado exitosamente! Iniciando sesión automáticamente...');
        await authService.login({ username: username.trim(), password });
        setTimeout(() => { onSuccess(); }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        .auth-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: #0A0B0E;
          display: flex; align-items: stretch;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* PANEL IZQUIERDO DE FIGMA */
        .auth-left-panel {
          flex: 1; position: relative;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 52px; overflow: hidden;
          background: linear-gradient(145deg, #0A192F 0%, #0F2D59 50%, #1A4E9E 100%);
        }
        .auth-left-panel::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 60%);
        }

        .auth-left-content { position: relative; z-index: 2; max-width: 520px; }

        .auth-badge-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25);
          color: #BFDBFE; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 24px;
        }

        .auth-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 36px; }
        .auth-logo-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        }
        .auth-logo-text { font-size: 1.25rem; font-weight: 900; color: #FFFFFF; letter-spacing: -0.02em; }
        .auth-logo-sub { font-size: 0.65rem; font-weight: 600; color: #93C5FD; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }

        .auth-hero-title {
          font-size: clamp(2rem, 3.2vw, 2.8rem); font-weight: 900;
          color: #FFFFFF; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 16px;
        }
        .auth-hero-desc { font-size: 0.9rem; color: #CBD5E1; line-height: 1.6; }

        .auth-stat-cards { display: flex; flex-direction: column; gap: 12px; margin-top: 36px; }
        .auth-stat-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px; padding: 14px 18px; backdrop-filter: blur(10px);
        }
        .auth-stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .auth-stat-info h4 { font-size: 0.825rem; font-weight: 700; color: #FFFFFF; margin: 0; }
        .auth-stat-info p { font-size: 0.72rem; color: #94A3B8; margin: 2px 0 0 0; }

        .auth-left-footer { position: relative; z-index: 2; display: flex; align-items: center; gap: 12px; font-size: 0.75rem; color: #94A3B8; }

        /* PANEL DERECHO BLANCO DE FIGMA */
        .auth-right-panel {
          width: 500px; min-width: 440px;
          background: #FFFFFF;
          display: flex; align-items: center; justify-content: center;
          padding: 44px; position: relative;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }

        .auth-form-container { width: 100%; max-width: 390px; }

        .auth-form-header { text-align: center; margin-bottom: 24px; }
        .auth-avatar-circle {
          width: 72px; height: 72px; border-radius: 50%;
          background: #EFF6FF; border: 3px solid #BFDBFE;
          margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;
          color: #2563EB; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15);
        }
        .auth-form-greeting { font-size: 0.75rem; font-weight: 700; color: #2563EB; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
        .auth-form-title { font-size: 1.75rem; font-weight: 800; color: #0F172A; letter-spacing: -0.03em; margin: 0; }
        .auth-form-subtitle { font-size: 0.825rem; color: #64748B; margin-top: 5px; }

        .auth-mode-toggle {
          display: flex; background: #F1F5F9;
          border: 1px solid #E2E8F0; border-radius: 9999px;
          padding: 4px; margin-bottom: 22px; gap: 4px;
        }
        .auth-mode-btn {
          flex: 1; padding: 9px 12px; font-size: 0.8rem; font-weight: 600;
          border-radius: 9999px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s ease; font-family: inherit;
        }
        .auth-mode-btn.active { background: #0F1E36; color: #fff; box-shadow: 0 4px 12px rgba(15, 30, 54, 0.2); }
        .auth-mode-btn.inactive { background: transparent; color: #64748B; }

        .auth-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px;
          font-size: 0.8rem; font-weight: 500; margin-bottom: 14px;
        }
        .auth-alert.error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #B91C1C; }
        .auth-alert.success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; }

        .auth-field { margin-bottom: 14px; }
        .auth-field-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.72rem; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
        }
        .auth-field-wrapper { position: relative; }
        .auth-field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; }

        .auth-input {
          width: 100%;
          background: #F8FAFC; border: 1px solid #CBD5E1;
          border-radius: 10px; padding: 12px 16px 12px 42px;
          color: #0F172A; font-size: 0.875rem; outline: none;
          transition: all 0.2s ease; font-family: inherit; box-sizing: border-box;
        }
        .auth-input::placeholder { color: #94A3B8; }
        .auth-input:focus {
          border-color: #2563EB; background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .auth-input.select-input { padding-left: 14px; }

        .auth-pw-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #94A3B8; cursor: pointer;
          padding: 3px; display: flex; align-items: center;
        }

        .auth-submit-btn {
          width: 100%; padding: 13px 20px;
          background: #2563EB; color: #fff;
          border: none; border-radius: 10px;
          font-size: 0.9rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease; margin-top: 10px; font-family: inherit;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: #1D4ED8; transform: translateY(-1px);
        }
        .auth-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-demo-section { margin-top: 22px; padding-top: 20px; border-top: 1px solid #E2E8F0; }
        .auth-demo-label {
          font-size: 0.7rem; font-weight: 700; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em;
          text-align: center; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .auth-demo-label::before, .auth-demo-label::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }
        .auth-demo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .auth-demo-btn {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 10px 6px;
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 10px; cursor: pointer; transition: all 0.2s ease;
          font-family: inherit; color: #475569;
        }
        .auth-demo-btn:hover:not(:disabled) {
          background: #EFF6FF; border-color: #93C5FD;
          color: #1E40AF; transform: translateY(-2px);
        }
        .auth-demo-emoji { font-size: 1.1rem; }
        .auth-demo-btn-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .auth-demo-btn-user { font-size: 0.6rem; color: #94A3B8; }

        @media (max-width: 900px) {
          .auth-left-panel { display: none; }
          .auth-right-panel { width: 100%; min-width: unset; }
        }
      `}</style>

      <div className="auth-overlay">
        {/* PANEL IZQUIERDO DE FIGMA */}
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <div className="auth-badge-pill">
              <Sparkles size={13} />
              <span>Portal Empresarial · UPDS Seguros</span>
            </div>

            <div className="auth-logo">
              <div className="auth-logo-icon">
                <Shield size={24} color="#FFFFFF" />
              </div>
              <div>
                <div className="auth-logo-text">DineroLi · UPDS</div>
                <div className="auth-logo-sub">Gestión Integral de Siniestros</div>
              </div>
            </div>

            <h1 className="auth-hero-title">
              Bienvenido al Portal Empresarial
            </h1>
            <p className="auth-hero-desc">
              Plataforma ágil para la liquidación transparente de siniestros. Verificación de pólizas en línea, peritajes digitales y auditoría continua anti-fraude.
            </p>

            <div className="auth-stat-cards">
              <div className="auth-stat-card">
                <div className="auth-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                  <Shield size={18} color="#93C5FD" />
                </div>
                <div className="auth-stat-info">
                  <h4>Autenticación Segura</h4>
                  <p>Sesiones cifradas y control granular por rol</p>
                </div>
              </div>

              <div className="auth-stat-card">
                <div className="auth-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                  <Star size={18} color="#6EE7B7" />
                </div>
                <div className="auth-stat-info">
                  <h4>Roles Corporativos</h4>
                  <p>Cliente Asegurado · Analista · Perito · Administrador</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <span>Ayuda</span>
            <span>·</span>
            <span>Política de Privacidad</span>
            <span>·</span>
            <span>Condiciones del Servicio</span>
          </div>
        </div>

        {/* PANEL DERECHO BLANCO DE FIGMA */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="auth-avatar-circle">
                <User size={34} />
              </div>
              <div className="auth-form-greeting">Portal Empresarial</div>
              <h2 className="auth-form-title">
                {mode === 'login' ? '¡Hola, Bienvenido!' : 'Crear Cuenta'}
              </h2>
              <p className="auth-form-subtitle">
                {mode === 'login'
                  ? 'Ingrese sus credenciales de colaborador o asegurado'
                  : 'Complete sus datos para registrarse en el sistema'}
              </p>
            </div>

            <div className="auth-mode-toggle">
              <button
                type="button"
                className={`auth-mode-btn ${mode === 'login' ? 'active' : 'inactive'}`}
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              >
                <LogIn size={13} /> Iniciar Sesión
              </button>
              <button
                type="button"
                className={`auth-mode-btn ${mode === 'register' ? 'active' : 'inactive'}`}
                onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              >
                <UserPlus size={13} /> Registrarse
              </button>
            </div>

            {error && (
              <div className="auth-alert error">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success">
                <CheckCircle size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-field-label"><User size={11} /> Usuario</label>
                <div className="auth-field-wrapper">
                  <User size={15} className="auth-field-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ej: admin_susann"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="auth-field">
                    <label className="auth-field-label"><User size={11} /> Nombre Completo</label>
                    <div className="auth-field-wrapper">
                      <User size={15} className="auth-field-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Ej: Lic. Susann Baldiviezo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-field-label"><Mail size={11} /> Correo Institucional</label>
                    <div className="auth-field-wrapper">
                      <Mail size={15} className="auth-field-icon" />
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="susann@upds.edu.bo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-field-label"><Building2 size={11} /> Rol en el Sistema</label>
                    <div className="auth-field-wrapper">
                      <select
                        className="auth-input select-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                      >
                        <option value="CLIENT">Cliente / Asegurado</option>
                        <option value="ANALYST">Analista de Siniestros</option>
                        <option value="ADJUSTER">Perito Ajustador</option>
                        <option value="SUPERVISOR">Supervisor de Operaciones</option>
                        <option value="DIRECTOR">Director Ejecutivo</option>
                        <option value="ADMIN">Administrador de Sistema</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label className="auth-field-label"><Lock size={11} /> Contraseña</label>
                <div className="auth-field-wrapper">
                  <Lock size={15} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <LogIn size={15} />
                    <span>{mode === 'login' ? 'Ingresar al Sistema' : 'Completar Registro'}</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>
                  ¿No puede acceder a su cuenta?
                </span>
              </div>
            </form>

            <div className="auth-demo-section">
              <div className="auth-demo-label">Acceso Rápido de Prueba</div>
              <div className="auth-demo-grid">
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => handleDemoLogin('juan_perez', 'password123')}
                  disabled={loading}
                >
                  <span className="auth-demo-emoji">👤</span>
                  <span className="auth-demo-btn-label">Cliente</span>
                  <span className="auth-demo-btn-user">juan_perez</span>
                </button>

                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => handleDemoLogin('carlos_analyst', 'password123')}
                  disabled={loading}
                >
                  <span className="auth-demo-emoji">📋</span>
                  <span className="auth-demo-btn-label">Analista</span>
                  <span className="auth-demo-btn-user">carlos</span>
                </button>

                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => handleDemoLogin('admin_susann', 'password123')}
                  disabled={loading}
                >
                  <span className="auth-demo-emoji">⚡</span>
                  <span className="auth-demo-btn-label">Admin</span>
                  <span className="auth-demo-btn-user">admin</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};