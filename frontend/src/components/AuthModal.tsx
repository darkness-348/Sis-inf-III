import React, { useState } from 'react';
import { Shield, Lock, User, Mail, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import type { UserRole } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');

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
        if (!username || !password) {
          setError('Por favor ingrese usuario y contraseña.');
          setLoading(false);
          return;
        }
        await authService.login({ username: username.trim(), password });
        onSuccess();
      } else {
        if (!username || !password || !email || !fullName) {
          setError('Por favor complete todos los campos requeridos.');
          setLoading(false);
          return;
        }
        await authService.register({
          username: username.trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        });

        setSuccessMsg('¡Usuario registrado exitosamente! Iniciando sesión automáticamente...');
        // Auto login after register
        await authService.login({ username: username.trim(), password });
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield style={{ width: '28px', height: '28px', color: '#FFFFFF' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            Sistema Liquidación de Siniestros
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
            Autenticación Segura con JWT Bearer (UPDS Clean Architecture)
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          padding: '4px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.6)',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            style={{
              padding: '8px 12px',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: mode === 'login' ? '#2563EB' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.2s'
            }}
          >
            <LogIn style={{ width: '15px', height: '15px' }} />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            style={{
              padding: '8px 12px',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: mode === 'register' ? '#2563EB' : 'transparent',
              color: mode === 'register' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus style={{ width: '15px', height: '15px' }} />
            <span>Registrarse</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#FCA5A5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.825rem'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6EE7B7',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.825rem'
          }}>
            <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">Nombre de Usuario *</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Ej: carlos_analyst"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Lic. Carlos Analyst"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Correo Electrónico *</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                    placeholder="carlos@seguros.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Rol en el Sistema *</label>
                <select 
                  className="form-input" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="CLIENT">Cliente / Asegurado</option>
                  <option value="ANALYST">Analista de Liquidación</option>
                  <option value="SUPERVISOR">Supervisor Senior</option>
                  <option value="DIRECTOR">Director Ejecutivo</option>
                  <option value="ADMIN">Administrador de Sistema</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="form-label">Contraseña *</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#64748B' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px' }}
          >
            {mode === 'login' ? (
              <>
                <LogIn style={{ width: '16px', height: '16px' }} />
                <span>{loading ? 'Verificando Credenciales...' : 'Ingresar al Sistema'}</span>
              </>
            ) : (
              <>
                <UserPlus style={{ width: '16px', height: '16px' }} />
                <span>{loading ? 'Creando Cuenta...' : 'Registrar Nueva Cuenta'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Access */}
        {mode === 'login' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.725rem', color: '#64748B', display: 'block', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>
              ACCESOS RÁPIDOS DE DEMOSTRACIÓN (SEED):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('juan_cliente', 'password123')}
                disabled={loading}
                className="btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.7rem', justifyContent: 'center', borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60A5FA' }}
              >
                Cliente Juan
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('carlos_analyst', 'password123')}
                disabled={loading}
                className="btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.7rem', justifyContent: 'center' }}
              >
                Analista Carlos
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin_upds', 'admin123')}
                disabled={loading}
                className="btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.7rem', justifyContent: 'center' }}
              >
                Admin UPDS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
