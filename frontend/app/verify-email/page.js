'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [form, setForm] = useState({ email, token: '' });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.token) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', {
        email: form.email,
        token: form.token
      });

      toast.success('Email vérifié avec succès !');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code de vérification incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Code de vérification renvoyé avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      {/* Decorative elements */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, var(--secondary-light) 0%, transparent 70%)', opacity: 0.3 }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--text-2)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 24,
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(0,82,204,0.2)'
            }}>
              <Mail size={32} color="white" />
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Vérification de l'email</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              Entrez le code à 6 chiffres envoyé à votre adresse email
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Code de vérification</label>
              <div style={{ position: 'relative' }}>
                <CheckCircle size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="input-field"
                  placeholder="123456"
                  style={{ 
                    paddingLeft: 44, 
                    fontSize: 20, 
                    fontWeight: 'bold',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                Entrez le code à 6 chiffres reçu par email
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Vérification...' : 'Vérifier mon email'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'all 0.2s ease',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                if (!resending) {
                  e.currentTarget.style.background = 'var(--primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!resending) {
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              <RefreshCw size={14} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
          </div>

          <div style={{ marginTop: 20, padding: '12px', background: 'var(--warning-light)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, textAlign: 'center' }}>
              <strong>Important:</strong> Vérifiez votre dossier spam si vous ne recevez pas l'email.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
