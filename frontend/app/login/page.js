'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Phone } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [inputType, setInputType] = useState('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Connexion réussie !');
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      // Check if it's a verification required error
      if (err.response?.data?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
        return;
      }
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,82,204,0.2)'
            }}>
              <Shield size={24} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, color: 'var(--text)' }}>
              Smart<span style={{ color: 'var(--primary)' }}>Assur</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Bienvenue</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Connectez-vous à votre espace</p>
          </div>

          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Email ou Téléphone</label>
              <div style={{ position: 'relative' }}>
                {inputType === 'email' ? (
                  <Mail size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                ) : (
                  <Phone size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                )}
                <input
                  type={inputType === 'email' ? 'email' : 'tel'}
                  required
                  className="input-field"
                  placeholder={inputType === 'email' ? 'votre@email.com' : '+216 12 345 678'}
                  style={{ paddingLeft: 44 }}
                  value={form.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Auto-detect input type based on content
                    if (value.includes('@')) {
                      setInputType('email');
                    } else if (/^[+]?[0-9\s-]*$/.test(value)) {
                      setInputType('phone');
                    }
                    setForm({ ...form, email: value });
                  }}
                />
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setInputType(inputType === 'email' ? 'phone' : 'email')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                    title={inputType === 'email' ? 'Utiliser le téléphone' : 'Utiliser l\'email'}
                  >
                    {inputType === 'email' ? <Phone size={16} /> : <Mail size={16} />}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {inputType === 'email' ? 'Entrez votre adresse email' : 'Entrez votre numéro de téléphone'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Connexion...' : <>Se connecter <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
          <Link href="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}