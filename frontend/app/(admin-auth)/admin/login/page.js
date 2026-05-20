'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      toast.success('Connexion administrateur réussie !');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accès refusé');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,82,204,0.3) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,0,200,0.2) 0%, transparent 70%)' }} />
      </div>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #0052cc, #6600cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,82,204,0.4)' }}>
              <Shield size={26} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, color: 'white' }}>Smart<span style={{ color: '#4d9fff' }}>Assur</span></span>
              <div style={{ fontSize: 11, color: '#8899bb', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Espace Administrateur</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>Connexion Admin</h2>
            <p style={{ color: '#8899bb', fontSize: 14 }}>Accès réservé aux administrateurs</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aabbcc', marginBottom: 8 }}>Email administrateur</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#4d9fff" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" required placeholder="admin@smartassur.com" style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem 1rem 0.875rem 44px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aabbcc', marginBottom: 8 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#4d9fff" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem 44px 0.875rem 44px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: loading ? '#334' : 'linear-gradient(135deg, #0052cc, #6600cc)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              {loading ? 'Connexion...' : <><span>Se connecter</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#556688' }}>
          <Link href="/" style={{ color: '#556688', textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}
