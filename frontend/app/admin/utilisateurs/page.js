'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Users, Trash2, Shield, User, Search, Edit3, Plus, X, Save,
  Mail, MapPin, Calendar, CheckCircle, AlertCircle, Eye, EyeOff,
  Hash, CreditCard, Camera, Phone
} from 'lucide-react';
import api from '../../../lib/api';

const labelSt = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 };
const required = <span style={{ color: 'var(--danger)' }}> *</span>;

// ─── Helper: build avatar URL from any format ───────────────────────────────
function buildAvatarUrl(profileImage) {
  if (!profileImage) return null;
  if (profileImage.startsWith('http')) return profileImage;
  if (profileImage.startsWith('/')) return `http://localhost:5000${profileImage}`;
  return `http://localhost:5000/uploads/${profileImage}`;
}

// ─── UserAvatar: shows image or initials, with error fallback ────────────────
function UserAvatar({ user, size = 40 }) {
  const [imgError, setImgError] = useState(false);
  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const src = buildAvatarUrl(user?.profileImage);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.35,
      border: '2px solid var(--border)',
    }}>
      {src && !imgError
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
        : initial
      }
    </div>
  );
}

// ─── FieldError ──────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
      <AlertCircle size={12} color="var(--danger)" />
      <span style={{ fontSize: 11, color: 'var(--danger)' }}>{msg}</span>
    </div>
  );
}

// ─── Field ──────────────────────────────────────────────────────────────
const Field = ({ label, req, icon: Icon, children, error }) => (
  <div>
    <label style={labelSt}>
      {Icon && <Icon size={13} style={{ display: 'inline', marginRight: 5 }} />}
      {label}{req && required}
    </label>
    {children}
    {error && <FieldError msg={error} />}
  </div>
);

// ─── Modal ──────────────────────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
    <div className="card" style={{ maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{subtitle}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6 }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

// ─── AvatarPicker ────────────────────────────────────────────────────────────
function AvatarPicker({ preview, name, onChange, size = 72 }) {
  const ref = useRef();
  const initial = name?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        onClick={() => ref.current.click()}
        title="Modifier la photo"
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          border: '3px solid var(--border)', boxShadow: '0 2px 10px rgba(0,82,204,0.15)',
        }}
        onMouseEnter={e => { const o = e.currentTarget.querySelector('.av-overlay'); if (o) o.style.opacity = '1'; }}
        onMouseLeave={e => { const o = e.currentTarget.querySelector('.av-overlay'); if (o) o.style.opacity = '0'; }}
      >
        {preview
          ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: 'white', fontWeight: 700, fontSize: size * 0.35 }}>{initial}</span>
        }
        <div className="av-overlay" style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s',
        }}>
          <Camera size={size * 0.28} color="white" />
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Photo (optionnel)</span>
    </div>
  );
}

// ─── IdSection ───────────────────────────────────────────────────────────────
function IdSection({ idType, idNumber, onChange }) {
  return (
    <div>
      <label style={labelSt}><CreditCard size={13} style={{ display: 'inline', marginRight: 5 }} />Pièce d'identité</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { value: 'cin', label: 'CIN', hint: 'ex: 12345678' },
          { value: 'sejour', label: 'Carte de séjour', hint: 'ex: A201XM456P' },
        ].map(opt => {
          const sel = idType === opt.value;
          return (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.55rem 0.9rem', borderRadius: 12, cursor: 'pointer',
              border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
              background: sel ? 'var(--primary-light)' : 'var(--surface)',
              transition: 'all 0.2s',
            }}>
              <input type="radio" value={opt.value} checked={sel}
                onChange={() => onChange({ idType: opt.value, idNumber: '' })}
                style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{opt.hint}</div>
              </div>
            </label>
          );
        })}
      </div>
      <input type="text" className="input-field"
        placeholder={idType === 'cin' ? 'Numéro CIN (ex: 12345678)' : 'Numéro carte (ex: A201XM456P)'}
        value={idNumber} onChange={e => onChange({ idNumber: e.target.value })} />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPwd, setShowPwd] = useState({ edit: false, add: false });

  const emptyNew = { username: '', email: '', phone: '', address: '', dateNaissance: '', codePostal: '', idType: 'cin', idNumber: '', password: '', role: 'user' };
  const [newUser, setNewUser] = useState(emptyNew);
  const [newPreview, setNewPreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [addErrors, setAddErrors] = useState({});

  const flash = (text, type = 'success') => {
    if (type === 'success') {
      toast.success(text);
    } else {
      toast.error(text);
    }
  };

  const fetchUsers = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    try { await api.delete(`/users/${id}`); flash('Utilisateur supprimé'); fetchUsers(); }
    catch { flash('Erreur lors de la suppression', 'error'); }
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleNewImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    setNewPreview(URL.createObjectURL(file));
  };

  const updateUser = async (userId, userData) => {
    try {
      if (editImageFile) {
        const payload = new FormData();
        Object.entries(userData).forEach(([k, v]) => {
          if (k === 'password' && (!v || v.trim() === '')) return;
          payload.append(k, v);
        });
        payload.append('profileImage', editImageFile);
        await api.put(`/users/${userId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const p = { ...userData };
        if (!p.password || p.password.trim() === '') delete p.password;
        await api.put(`/users/${userId}`, p);
      }
      flash('Utilisateur mis à jour');
      setEditingUser(null);
      setEditImageFile(null);
      setEditPreview(null);
      fetchUsers();
    } catch { flash('Erreur lors de la mise à jour', 'error'); }
  };

  const validateNew = () => {
    const e = {};
    if (!newUser.username.trim()) e.username = 'Requis.';
    if (!newUser.email.trim()) e.email = 'Requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) e.email = 'Email invalide.';
    if (!newUser.phone.trim()) e.phone = 'Requis.';
    else if (!/^[+]?[0-9]{8,15}$/.test(newUser.phone.replace(/\s/g, ''))) e.phone = 'Numéro de téléphone invalide.';
    if (!newUser.address.trim()) e.address = 'Requis.';
    if (!newUser.dateNaissance) e.dateNaissance = 'Requis.';
    if (!newUser.password || newUser.password.length < 6) e.password = 'Minimum 6 caractères.';
    if (newUser.codePostal && !/^\d{4}$/.test(newUser.codePostal)) e.codePostal = 'Exactement 4 chiffres.';
    if (!newUser.idNumber.trim()) {
      e.idNumber = 'Requis.';
    } else if (newUser.idType === 'cin') {
      if (!/^\d{8}$/.test(newUser.idNumber)) e.idNumber = 'CIN invalide (8 chiffres).';
    } else {
      if (!/^[A-Za-z0-9]+$/.test(newUser.idNumber)) e.idNumber = 'Carte de séjour invalide (lettres et chiffres uniquement).';
    }
    return e;
  };

  const addUser = async () => {
    const errs = validateNew();
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    try {
      if (newImageFile) {
        const fd = new FormData();
        Object.entries(newUser).forEach(([k, v]) => fd.append(k, v));
        fd.append('profileImage', newImageFile);
        await api.post('/auth/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/auth/register', newUser);
      }
      flash('Utilisateur ajouté');
      setNewUser(emptyNew); setShowAddForm(false); setAddErrors({});
      setNewPreview(null); setNewImageFile(null);
      fetchUsers();
    } catch (err) { flash(err.response?.data?.message || "Erreur lors de l'ajout", 'error'); }
  };

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try { await api.put(`/users/${u._id}`, { role: newRole }); flash(`Rôle changé : ${newRole === 'admin' ? 'Administrateur' : 'Client'}`); fetchUsers(); }
    catch { flash('Erreur lors du changement de rôle', 'error'); }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administration</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Utilisateurs</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez tous les utilisateurs de la plateforme</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
              <Search size={16} color="var(--text-3)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: 200 }} />
            </div>
            <button onClick={() => setShowAddForm(true)} className="btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>
      </div>

      
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total utilisateurs', value: users.length, icon: Users, color: 'primary', bg: 'var(--primary-light)' },
          { label: 'Clients', value: users.filter(u => u.role === 'user').length, icon: User, color: 'success', bg: 'var(--success-light)' },
          { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'accent', bg: 'var(--accent-light)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={`var(--${color})`} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: `var(--${color})` }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <Users size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun utilisateur trouvé</h3>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Adresse</th>
                  <th>Code postal</th>
                  <th>Pièce d'identité</th>
                  <th>Date naissance</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <UserAvatar user={u} size={40} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{u.username || 'Sans nom'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.email}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.phone}</p>
                        </div>
                      </div>
                    </td>
                                        <td>{u.address
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} color="var(--text-3)" /><span style={{ fontSize: 13 }}>{u.address}</span></div>
                      : <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td>{u.codePostal
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={12} color="var(--text-3)" /><span style={{ fontSize: 13 }}>{u.codePostal}</span></div>
                      : <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td>{u.idNumber
                      ? <div><span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block' }}>{u.idType === 'sejour' ? 'Carte séjour' : 'CIN'}</span><span style={{ fontSize: 13, fontWeight: 500 }}>{u.idNumber}</span></div>
                      : <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td>{u.dateNaissance
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={12} color="var(--text-3)" /><span style={{ fontSize: 13 }}>{formatDate(u.dateNaissance)}</span></div>
                      : <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td>
                      <button onClick={() => toggleRole(u)} className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`} style={{ gap: 6, cursor: 'pointer' }}>
                        {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                        {u.role === 'admin' ? 'Admin' : 'Client'}
                      </button>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => {
                          setEditingUser({ ...u, password: '', dateNaissance: u.dateNaissance ? u.dateNaissance.split('T')[0] : '' });
                          setEditPreview(buildAvatarUrl(u.profileImage));
                          setEditImageFile(null);
                        }} style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="btn-danger" style={{ padding: '0.4rem 0.8rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {editingUser && (
        <Modal title="Modifier l'utilisateur" subtitle={editingUser.email} onClose={() => { setEditingUser(null); setEditPreview(null); setEditImageFile(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
              <AvatarPicker preview={editPreview} name={editingUser.username} onChange={handleEditImage} size={80} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom complet" icon={User}>
                <input value={editingUser.username || ''} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="Nom complet" className="input-field" />
              </Field>
              <Field label="Email" icon={Mail}>
                <input value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Email" type="email" className="input-field" />
              </Field>
            </div>
            <Field label="Téléphone" icon={Phone}>
              <input value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                placeholder="+216 12 345 678" type="tel" className="input-field" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14 }}>
              <Field label="Adresse" req icon={MapPin}>
                <input value={editingUser.address || ''} onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                  placeholder="Adresse" className="input-field" />
              </Field>
              <Field label="Code postal" icon={Hash}>
                <input value={editingUser.codePostal || ''} maxLength={4}
                  onChange={e => setEditingUser({ ...editingUser, codePostal: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="1000" className="input-field" />
              </Field>
            </div>
            <Field label="Date de naissance" req icon={Calendar}>
              <input value={editingUser.dateNaissance || ''} onChange={e => setEditingUser({ ...editingUser, dateNaissance: e.target.value })}
                type="date" className="input-field" />
            </Field>
            <IdSection
              idType={editingUser.idType || 'cin'}
              idNumber={editingUser.idNumber || ''}
              onChange={(patch) => setEditingUser({ ...editingUser, ...patch })}
            />
            <Field label="Nouveau mot de passe">
              <div style={{ position: 'relative' }}>
                <input value={editingUser.password || ''} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Laisser vide pour conserver" type={showPwd.edit ? 'text' : 'password'}
                  className="input-field" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(s => ({ ...s, edit: !s.edit }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showPwd.edit ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>Laissez vide pour conserver le mot de passe actuel</p>
            </Field>
            <Field label="Rôle">
              <select value={editingUser.role || 'user'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="input-field">
                <option value="user">Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button onClick={() => updateUser(editingUser._id, editingUser)} className="btn-primary" style={{ flex: 1, gap: 8 }}>
                <Save size={16} /> Enregistrer
              </button>
              <button onClick={() => { setEditingUser(null); setEditPreview(null); setEditImageFile(null); }} className="btn-outline" style={{ flex: 1 }}>Annuler</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD Modal */}
      {showAddForm && (
        <Modal title="Ajouter un utilisateur" subtitle="Créez un nouveau compte utilisateur" onClose={() => { setShowAddForm(false); setAddErrors({}); setNewPreview(null); setNewImageFile(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
              <AvatarPicker preview={newPreview} name={newUser.username} onChange={handleNewImage} size={80} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom complet" req icon={User} error={addErrors.username}>
                <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Jean Dupont" className="input-field" style={{ borderColor: addErrors.username ? 'var(--danger)' : '' }} />
              </Field>
              <Field label="Email" req icon={Mail} error={addErrors.email}>
                <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="votre@email.com" type="email" className="input-field" style={{ borderColor: addErrors.email ? 'var(--danger)' : '' }} />
              </Field>
            </div>
            <Field label="Téléphone" req icon={Phone} error={addErrors.phone}>
              <input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+216 12 345 678" type="tel" className="input-field" style={{ borderColor: addErrors.phone ? 'var(--danger)' : '' }} />
            </Field>
            <Field label="Mot de passe" req error={addErrors.password}>
              <div style={{ position: 'relative' }}>
                <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 caractères" type={showPwd.add ? 'text' : 'password'}
                  className="input-field" style={{ paddingRight: 44, borderColor: addErrors.password ? 'var(--danger)' : '' }} />
                <button type="button" onClick={() => setShowPwd(s => ({ ...s, add: !s.add }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showPwd.add ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14 }}>
              <Field label="Adresse" req icon={MapPin} error={addErrors.address}>
                <input value={newUser.address} onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="Adresse" className="input-field" style={{ borderColor: addErrors.address ? 'var(--danger)' : '' }} />
              </Field>
              <Field label="Code postal" icon={Hash} error={addErrors.codePostal}>
                <input value={newUser.codePostal} maxLength={4}
                  onChange={e => setNewUser({ ...newUser, codePostal: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="1000" className="input-field" style={{ borderColor: addErrors.codePostal ? 'var(--danger)' : '' }} />
              </Field>
            </div>
            <Field label="Date de naissance" req icon={Calendar} error={addErrors.dateNaissance}>
              <input value={newUser.dateNaissance} onChange={e => setNewUser({ ...newUser, dateNaissance: e.target.value })}
                type="date" className="input-field" style={{ borderColor: addErrors.dateNaissance ? 'var(--danger)' : '' }} />
            </Field>
            <div>
              <label style={labelSt}><CreditCard size={13} style={{ display: 'inline', marginRight: 5 }} />Pièce d'identité{required}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { value: 'cin', label: 'CIN', hint: 'ex: 12345678' },
                  { value: 'sejour', label: 'Carte de séjour', hint: 'ex: A201XM456P' },
                ].map(opt => {
                  const sel = newUser.idType === opt.value;
                  return (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.9rem', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary-light)' : 'var(--surface)', transition: 'all 0.2s' }}>
                      <input type="radio" value={opt.value} checked={sel} onChange={() => setNewUser({ ...newUser, idType: opt.value, idNumber: '' })} style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{opt.hint}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <input type="text" className="input-field"
                placeholder={newUser.idType === 'cin' ? 'Numéro CIN (ex: 12345678)' : 'Numéro carte (ex: A201XM456P)'}
                value={newUser.idNumber} onChange={e => setNewUser({ ...newUser, idNumber: e.target.value })}
                style={{ borderColor: addErrors.idNumber ? 'var(--danger)' : '' }} />
              <FieldError msg={addErrors.idNumber} />
            </div>
            <Field label="Rôle">
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="input-field">
                <option value="user">Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button onClick={addUser} className="btn-primary" style={{ flex: 1, gap: 8 }}>
                <Save size={16} /> Ajouter l'utilisateur
              </button>
              <button onClick={() => { setShowAddForm(false); setAddErrors({}); setNewPreview(null); setNewImageFile(null); }} className="btn-outline" style={{ flex: 1 }}>Annuler</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
