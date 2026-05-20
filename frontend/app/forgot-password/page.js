'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code + new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: request the reset code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Code envoyé ! Vérifiez votre email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: submit code + new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit avoir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      toast.success('Mot de passe réinitialisé avec succès !');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, var(--secondary-light) 0%, transparent 70%)', opacity: 0.3 }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,82,204,0.2)' }}>
              <Shield size={24} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, color: 'var(--text)' }}>
              Smart<span style={{ color: 'var(--primary)' }}>Assur</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <KeyRound size={26} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>
              {step === 1 ? 'Mot de passe oublié ?' : 'Réinitialiser le mot de passe'}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              {step === 1
                ? 'Entrez votre email et nous vous enverrons un code.'
                : `Un code a été envoyé à ${email}`}
            </p>
          </div>

          {/* STEP 1 — Enter email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="votre@email.com"
                    style={{ paddingLeft: 44 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: 15 }}>
                {loading ? 'Envoi...' : <>Envoyer le code <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* STEP 2 — Enter code + new password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Code reçu par email</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="123456"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: 700 }}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Minimum 6 caractères"
                    style={{ paddingLeft: 44 }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: 15 }}>
                {loading ? 'Réinitialisation...' : <>Réinitialiser le mot de passe <ArrowRight size={16} /></>}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}
              >
                ← Changer d'email
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'var(--text-3)', fontSize: 14, textDecoration: 'none' }}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
