'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  User, Shield, Save, Mail, MapPin, Calendar, Edit3,
  CheckCircle, AlertCircle, Camera, Key, Smartphone,
  Hash, CreditCard, Eye, EyeOff, Phone
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function ProfilPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef();

  const [form, setForm] = useState({
    username: '', email: '', phone: '', address: '',
    dateNaissance: '', codePostal: '',
    idType: 'cin', idNumber: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPwd, setShowPwd]     = useState({ cur: false, new: false, conf: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch fresh user data from API to always get latest profileImage
  useEffect(() => {
    if (!user) return;
    const loadFreshUser = async () => {
      try {
        const { data } = await api.get(`/users/${user._id}`);
        const fresh = { ...user, ...data };
        updateUser(fresh);
        setForm({
          username:      fresh.username      || '',
          email:         fresh.email         || '',
          phone:         fresh.phone         || '',
          address:       fresh.address       || '',
          dateNaissance: fresh.dateNaissance ? fresh.dateNaissance.split('T')[0] : '',
          codePostal:    fresh.codePostal    || '',
          idType:        fresh.idType        || 'cin',
          idNumber:      fresh.idNumber      || '',
        });
        if (fresh.profileImage) {
          const p = fresh.profileImage;
          const imgUrl = p.startsWith('http') ? p : `http://localhost:5000${p.startsWith('/') ? p : '/uploads/' + p}`;
          setProfilePreview(imgUrl);
        }
      } catch {
        // Fallback to cookie data
        setForm({
          username:      user.username      || '',
          email:         user.email         || '',
          phone:         user.phone         || '',
          address:       user.address       || '',
          dateNaissance: user.dateNaissance ? user.dateNaissance.split('T')[0] : '',
          codePostal:    user.codePostal    || '',
          idType:        user.idType        || 'cin',
          idNumber:      user.idNumber      || '',
        });
        if (user.profileImage) {
          const p = user.profileImage;
          const imgUrl = p.startsWith('http') ? p : `http://localhost:5000${p.startsWith('/') ? p : '/uploads/' + p}`;
          setProfilePreview(imgUrl);
        }
      }
    };
    loadFreshUser();
  }, [user?._id]);

  const flash = (text, type = 'success') => {
    if (type === 'success') {
      toast.success(text);
    } else {
      toast.error(text);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { flash('Fichier image requis', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)   { flash('Image trop lourde (max 5 Mo)', 'error'); return; }
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.codePostal && !/^\d{4}$/.test(form.codePostal)) {
      flash('Le code postal doit contenir exactement 4 chiffres.', 'error'); return;
    }
    if (form.phone && !/^[+]?[0-9]{8,15}$/.test(form.phone.replace(/\s/g, ''))) {
      flash('Numéro de téléphone invalide.', 'error'); return;
    }
    if (form.idType === 'cin' && form.idNumber && !/^\d{8}$/.test(form.idNumber)) {
      flash('CIN invalide (8 chiffres).', 'error'); return;
    }
    if (form.idType === 'sejour' && form.idNumber && !/^[A-Za-z0-9]+$/.test(form.idNumber)) {
      flash('Carte de séjour invalide (lettres et chiffres uniquement).', 'error'); return;
    }
    setLoading(true);
    try {
      let data;
      if (profileImage) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append('profileImage', profileImage);
        const res = await api.put(`/users/${user._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        data = res.data;
      } else {
        const res = await api.put(`/users/${user._id}`, form);
        data = res.data;
      }
      // Update context + cookie so avatar shows everywhere immediately
      updateUser(data.user || {});
      if (data.user?.profileImage) {
        const p = data.user.profileImage;
        const imgUrl = p.startsWith('http') ? p : `http://localhost:5000${p.startsWith('/') ? p : '/uploads/' + p}`;
        setProfilePreview(imgUrl);
        setProfileImage(null);
      }
      flash('Profil mis à jour avec succès !');
    } catch (err) {
      flash(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      flash('Les mots de passe ne correspondent pas', 'error'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      flash('Minimum 6 caractères', 'error'); return;
    }
    setPasswordLoading(true);
    try {
      await api.put(`/users/${user._id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      flash('Mot de passe mis à jour avec succès !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      flash(err.response?.data?.message || 'Erreur lors du changement de mot de passe', 'error');
    }
    setPasswordLoading(false);
  };

  const labelSt = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 };
  const tabs = [
    { id: 'profile',  label: 'Mon profil', icon: User   },
    { id: 'security', label: 'Sécurité',   icon: Shield },
  ];

  const getMemberDuration = () => {
    if (!user?.createdAt) return 'Nouveau membre';
    const months = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'Moins d\'un mois';
    return months === 1 ? '1 mois' : `${months} mois`;
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mon compte</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Mon Profil</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez vos informations personnelles</p>
      </div>


      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '0.6rem 1.25rem', fontSize: 13, gap: 8 }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div className="card" style={{ padding: '2rem' }}>

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <Edit3 size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Modifier mes informations</h2>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Photo de profil */}
                <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Avatar */}
                    <div
                      onClick={() => fileRef.current.click()}
                      title="Modifier la photo"
                      style={{
                        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', overflow: 'hidden', position: 'relative',
                        border: '3px solid var(--border)',
                        boxShadow: '0 4px 16px rgba(0,82,204,0.18)',
                      }}
                      onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = '0'}
                    >
                      {profilePreview
                        ? <img src={profilePreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: 'white', fontWeight: 700, fontSize: 32 }}>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                      }
                      <div className="overlay" style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                      }}>
                        <Camera size={22} color="white" />
                      </div>
                    </div>

                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Photo de profil</p>
                      {profileImage && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.28rem 0.7rem', borderRadius: 20, background: 'var(--primary-light)', marginBottom: 8 }}>
                          <CheckCircle size={12} color="var(--primary)" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>Nouvelle photo prête à être enregistrée</span>
                        </div>
                      )}
                      <button type="button" onClick={() => fileRef.current.click()}
                        className="btn-outline" style={{ padding: '0.38rem 0.9rem', fontSize: 12, gap: 6 }}>
                        <Camera size={13} /> {profilePreview ? 'Changer la photo' : 'Ajouter une photo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nom + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={labelSt}><User size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Nom complet</label>
                    <input type="text" className="input-field" placeholder="Jean Dupont"
                      value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelSt}><Mail size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Adresse email</label>
                    <input type="email" className="input-field" placeholder="votre@email.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label style={labelSt}><Phone size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Téléphone</label>
                  <input type="tel" className="input-field" placeholder="+216 12 345 678"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>

                {/* Adresse + Code postal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 16 }}>
                  <div>
                    <label style={labelSt}><MapPin size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Adresse</label>
                    <input type="text" className="input-field" placeholder="123 rue de la Paix"
                      value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelSt}><Hash size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Code postal</label>
                    <input type="text" className="input-field" placeholder="1000" maxLength={4}
                      value={form.codePostal}
                      onChange={e => setForm({ ...form, codePostal: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label style={labelSt}><Calendar size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Date de naissance</label>
                  <input type="date" className="input-field"
                    value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} />
                </div>

                {/* Pièce d'identité */}
                <div>
                  <label style={labelSt}><CreditCard size={13} color="var(--text-3)" style={{ display: 'inline', marginRight: 5 }} />Pièce d'identité</label>
                  {/* Radio cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { value: 'cin',    label: 'CIN',            hint: 'ex: 12345678' },
                      { value: 'sejour', label: 'Carte de séjour', hint: 'ex: A201XM456P'   },
                    ].map(opt => {
                      const sel = form.idType === opt.value;
                      return (
                        <label key={opt.value} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '0.6rem 0.9rem', borderRadius: 12, cursor: 'pointer',
                          border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                          background: sel ? 'var(--primary-light)' : 'var(--surface)',
                          transition: 'all 0.2s',
                        }}>
                          <input type="radio" name="idType" value={opt.value} checked={sel}
                            onChange={() => setForm({ ...form, idType: opt.value, idNumber: '' })}
                            style={{ accentColor: 'var(--primary)', width: 15, height: 15, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: sel ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{opt.hint}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <input type="text" className="input-field"
                    placeholder={form.idType === 'cin' ? 'Numéro CIN (ex: 12345678)' : 'Numéro carte (ex: A201XM456P)'}
                    value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} />
                </div>

                <div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ gap: 8 }}>
                    {loading ? 'Enregistrement...' : <><Save size={16} />Enregistrer les modifications</>}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <Key size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Changer mon mot de passe</h2>
              </div>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { key: 'currentPassword', label: 'Mot de passe actuel',           field: 'cur',  ph: 'Entrez votre mot de passe actuel' },
                  { key: 'newPassword',     label: 'Nouveau mot de passe',          field: 'new',  ph: 'Minimum 6 caractères' },
                  { key: 'confirmPassword', label: 'Confirmer le nouveau mot de passe', field: 'conf', ph: 'Répétez le nouveau mot de passe' },
                ].map(({ key, label, field, ph }) => (
                  <div key={key}>
                    <label style={labelSt}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPwd[field] ? 'text' : 'password'} className="input-field" placeholder={ph}
                        style={{ paddingRight: 44 }}
                        value={passwordForm[key]}
                        onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                        required />
                      <button type="button"
                        onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
                        {showPwd[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div>
                  <button type="submit" disabled={passwordLoading} className="btn-primary" style={{ gap: 8 }}>
                    {passwordLoading ? 'Mise à jour...' : <><Shield size={16} />Changer le mot de passe</>}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: 24, padding: '1rem', background: 'var(--info-light)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Smartphone size={16} color="var(--info)" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)' }}>Conseil de sécurité</p>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  Utilisez un mot de passe unique et complexe. Ne le partagez jamais avec personne.
                </p>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
}