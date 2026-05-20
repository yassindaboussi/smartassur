'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import {
  Shield, Mail, Lock, User, MapPin, Calendar,
  ArrowRight, ArrowLeft, Eye, EyeOff, Camera, CreditCard,
  Hash, AlertCircle, Phone, CheckCircle
} from 'lucide-react';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
      <AlertCircle size={13} color="var(--danger)" />
      <span style={{ fontSize: 11, color: 'var(--danger)' }}>{msg}</span>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const fileRef = useRef();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dateNaissance: '',
    codePostal: '',
    idType: 'cin',
    idNumber: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [step, setStep] = useState(1);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(e => ({ ...e, profileImage: 'Image requise (jpg, png)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, profileImage: 'Max 5 Mo' }));
      return;
    }
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors(e => ({ ...e, profileImage: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Requis';
    else if (form.username.trim().length < 3) e.username = 'Min 3 caractères';

    if (!form.email.trim()) e.email = 'Requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';

    if (!form.password) e.password = 'Requis';
    else if (form.password.length < 6) e.password = 'Min 6 caractères';

    if (!form.confirmPassword) e.confirmPassword = 'Requis';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Non identique';

    if (!form.phone.trim()) e.phone = 'Requis';
    else if (!/^[+]?[0-9]{8,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Tél invalide';

    return e;
  };

  const validateStep2 = () => {
    const e = {};
    
    if (!form.address.trim()) e.address = 'Requis';
    if (!form.dateNaissance) e.dateNaissance = 'Requis';
    else {
      const birthDate = new Date(form.dateNaissance);
      const today = new Date();
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) e.dateNaissance = '18 ans minimum';
    }

    if (form.codePostal && !/^\d{4}$/.test(form.codePostal))
      e.codePostal = '4 chiffres';

    if (!form.idNumber.trim()) {
      e.idNumber = 'Requis';
    } else if (form.idType === 'cin') {
      if (!/^\d{8}$/.test(form.idNumber)) e.idNumber = 'CIN: 8 chiffres';
    } else {
      if (!/^[A-Za-z0-9]+$/.test(form.idNumber))
        e.idNumber = 'Format invalide';
    }

    return e;
  };

  const handleNextStep = () => {
    const step1Errors = validateStep1();
    if (Object.keys(step1Errors).length) {
      setErrors(step1Errors);
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    
    setLoading(true);
    try {
      if (profileImage) {
        const fd = new FormData();
        fd.append('username', form.username.trim());
        fd.append('email', form.email.trim());
        fd.append('password', form.password);
        fd.append('phone', form.phone.trim());
        fd.append('address', form.address.trim());
        fd.append('dateNaissance', form.dateNaissance);
        fd.append('codePostal', form.codePostal.trim());
        fd.append('idType', form.idType);
        fd.append('idNumber', form.idNumber.trim());
        fd.append('profileImage', profileImage);
        await register(fd, true);
      } else {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          address: form.address.trim(),
          dateNaissance: form.dateNaissance,
          codePostal: form.codePostal.trim(),
          idType: form.idType,
          idNumber: form.idNumber.trim(),
        };
        await register(payload);
      }
      toast.success('Inscription réussie ! Vérifiez votre email.');
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
    width: '100%',
    padding: '0.65rem 0.75rem 0.65rem 2.5rem',
    borderRadius: 10,
    border: `1.5px solid ${hasErr ? 'var(--danger)' : 'var(--border)'}`,
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--text-2)', marginBottom: 4,
  };

  const iconAbsStyle = {
    position: 'absolute', left: 10, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
  };

  const StepIndicator = () => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step >= s ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface-2)',
              color: step >= s ? 'white' : 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 4px',
              fontWeight: 600,
              fontSize: 14,
            }}>
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
            <div style={{ fontSize: 10, color: step >= s ? 'var(--primary)' : 'var(--text-3)', fontWeight: step >= s ? 600 : 400 }}>
              {s === 1 ? 'Compte' : 'Profil'}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${step === 1 ? 50 : 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0,82,204,0.2)',
            }}>
              <Shield size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>
              Smart<span style={{ color: 'var(--primary)' }}>Assur</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <StepIndicator />
          
          <form onSubmit={handleSubmit} noValidate>
            {/* ÉTAPE 1 : Identité & Connexion - 2 inputs par ligne */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Photo de profil + espace (centré) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{
                      width: 70, height: 70, borderRadius: '50%',
                      border: `2px dashed ${errors.profileImage ? 'var(--danger)' : 'var(--border)'}`,
                      background: 'var(--surface-2)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    {profilePreview
                      ? <img src={profilePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <>
                          <Camera size={20} color="var(--text-3)" />
                          <span style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>Photo</span>
                        </>
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>
                {errors.profileImage && <div style={{ textAlign: 'center' }}><FieldError msg={errors.profileImage} /></div>}

                {/* Ligne 1: Nom + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nom <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input type="text" placeholder="Jean Dupont" style={inputStyle(errors.username)}
                        value={form.username} onChange={e => set('username', e.target.value)} />
                    </div>
                    <FieldError msg={errors.username} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input type="email" placeholder="email@exemple.com" style={inputStyle(errors.email)}
                        value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <FieldError msg={errors.email} />
                  </div>
                </div>

                {/* Ligne 2: Téléphone + (vide ou espace réservé) */}
                <div>
                  <label style={labelStyle}>Téléphone <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} color="var(--text-3)" style={iconAbsStyle} />
                    <input type="tel" placeholder="+216 12 345 678" style={inputStyle(errors.phone)}
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <FieldError msg={errors.phone} />
                </div>

                {/* Ligne 3: Mot de passe + Confirmation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Mot de passe <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Min 6 car."
                        style={{ ...inputStyle(errors.password), paddingRight: 36 }}
                        value={form.password} onChange={e => set('password', e.target.value)} />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <FieldError msg={errors.password} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmation <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        placeholder="Confirmer"
                        style={{ ...inputStyle(errors.confirmPassword), paddingRight: 36 }}
                        value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                        {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <FieldError msg={errors.confirmPassword} />
                  </div>
                </div>

                {/* Bouton Suivant */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: 14, marginTop: 6, gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Continuer <ArrowRight size={14} />
                  </span>
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : Informations personnelles */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Ligne 1: Adresse + Code postal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Adresse <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input type="text" placeholder="123 rue de la Paix" style={inputStyle(errors.address)}
                        value={form.address} onChange={e => set('address', e.target.value)} />
                    </div>
                    <FieldError msg={errors.address} />
                  </div>
                  <div>
                    <label style={labelStyle}>Code postal</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={14} color="var(--text-3)" style={iconAbsStyle} />
                      <input
                        type="text"
                        placeholder="1000"
                        maxLength={4}
                        style={inputStyle(errors.codePostal)}
                        value={form.codePostal}
                        onChange={e => set('codePostal', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      />
                    </div>
                    <FieldError msg={errors.codePostal} />
                  </div>
                </div>

                {/* Ligne 2: Date naissance */}
                <div>
                  <label style={labelStyle}>Date de naissance <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={14} color="var(--text-3)" style={iconAbsStyle} />
                    <input type="date" style={inputStyle(errors.dateNaissance)}
                      value={form.dateNaissance} onChange={e => set('dateNaissance', e.target.value)} />
                  </div>
                  <FieldError msg={errors.dateNaissance} />
                </div>

                {/* Ligne 3: Type pièce + Numéro */}
                <div>
                  <label style={labelStyle}>Pièce d'identité <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { value: 'cin', label: 'CIN' },
                      { value: 'sejour', label: 'Carte séjour' },
                    ].map(opt => {
                      const selected = form.idType === opt.value;
                      return (
                        <label key={opt.value} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '0.5rem 0.7rem', borderRadius: 10, cursor: 'pointer',
                          border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                          background: selected ? 'var(--primary-light)' : 'var(--surface)',
                          fontSize: 12,
                        }}>
                          <input
                            type="radio" name="idType" value={opt.value}
                            checked={selected}
                            onChange={() => { set('idType', opt.value); set('idNumber', ''); }}
                            style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }}
                          />
                          <span style={{ fontWeight: selected ? 600 : 400 }}>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <CreditCard size={14} color="var(--text-3)" style={iconAbsStyle} />
                    <input
                      type="text"
                      placeholder={form.idType === 'cin' ? 'Numéro CIN (8 chiffres)' : 'Numéro carte de séjour'}
                      style={inputStyle(errors.idNumber)}
                      value={form.idNumber}
                      onChange={e => set('idNumber', e.target.value)}
                    />
                  </div>
                  <FieldError msg={errors.idNumber} />
                </div>

                {/* Boutons navigation */}
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}>
                    <ArrowLeft size={14} /> Retour
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center', padding: '0.75rem', fontSize: 13, gap: 6 }}>
                    {loading
                      ? 'Création...'
                      : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          Créer mon compte <CheckCircle size={14} />
                        </span>
                    }
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Déjà un compte ?{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-3)' }}>
          <Link href="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}