'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MessageSquare, Send, X, Trash2, Clock, CheckCircle,
  Search, Eye, ArrowLeft, Calendar,
  FileText, Headphones, Shield, Hash, ChevronDown, Mail, Phone, Image
} from 'lucide-react';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

function StatusDialog({ reclamation, onClose, onSave }) {
  const [form, setForm] = useState({
    status: reclamation.status,
    adminResponse: reclamation.adminResponse || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(reclamation._id, form);
    setSaving(false);
  };

  const statusOptions = [
    { value: 'en attente', label: 'En attente', color: 'var(--warning)', bg: 'var(--warning-light)' },
    { value: 'en cours',   label: 'En cours',   color: 'var(--info)',    bg: 'var(--info-light)'    },
    { value: 'résolu',     label: 'Résolu',      color: 'var(--success)', bg: 'var(--success-light)' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Modifier le statut</h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 46 }}>
              #{reclamation._id?.slice(-8).toUpperCase()} — {reclamation.subject}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Nouveau statut</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, status: opt.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${form.status === opt.value ? opt.color : 'var(--border)'}`,
                  background: form.status === opt.value ? opt.bg : 'var(--surface)',
                  transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: form.status === opt.value ? opt.color : 'var(--text-2)', flex: 1 }}>{opt.label}</span>
                {form.status === opt.value && <CheckCircle size={15} color={opt.color} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            Réponse au client <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optionnel)</span>
          </label>
          <textarea
            rows={4} className="input-field"
            placeholder="Votre réponse au client..."
            value={form.adminResponse}
            onChange={(e) => setForm({ ...form, adminResponse: e.target.value })}
            style={{ resize: 'vertical', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, gap: 8, opacity: saving ? 0.7 : 1 }}>
            <Send size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button onClick={onClose} className="btn-outline" style={{ flex: 1 }}>
            <X size={14} /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReclamations() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dialogRec, setDialogRec] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try { const { data } = await api.get('/reclamations'); setReclamations(data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const saveStatus = async (id, form) => {
    try {
      await api.put(`/reclamations/${id}`, form);
      toast.success('Réclamation mise à jour');
      setDialogRec(null);
      fetchAll();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteRec = async (id) => {
    if (!confirm('Supprimer cette réclamation ?')) return;
    try {
      await api.delete(`/reclamations/${id}`);
      toast.success('Réclamation supprimée');
      setSelectedId(null);
      fetchAll();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const STATUSES = ['tous', 'en attente', 'en cours', 'résolu'];
  const statusColors = { 'en attente': 'warning', 'en cours': 'info', 'résolu': 'success' };
  const statusIcons = { 'en attente': Clock, 'en cours': Headphones, 'résolu': CheckCircle };

  const filtered = reclamations.filter(r => {
    if (filter !== 'tous' && r.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.subject?.toLowerCase().includes(s) ||
        r.user?.username?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const selected = reclamations.find(r => r._id === selectedId);

  if (selected) {
    const cfg = statusColors[selected.status] || 'warning';
    const StatusIcon = statusIcons[selected.status] || Clock;

    return (
      <div>
        {dialogRec && <StatusDialog reclamation={dialogRec} onClose={() => setDialogRec(null)} onSave={saveStatus} />}


        <button onClick={() => setSelectedId(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Retour aux réclamations
        </button>

        <div className="animate-fade-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="var(--primary)" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Détail réclamation</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', marginBottom: 4 }}>{selected.subject}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Référence #{selected._id?.slice(-8).toUpperCase()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={20} color="var(--primary)" />
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{selected.subject}</h2>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>#{selected._id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
              <StatusBadge status={selected.status} size="md" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Message du client</p>
              <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
            </div>

            {selected.adminResponse && (
              <div style={{ marginBottom: 16, padding: '1rem', background: 'var(--success-light)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Shield size={13} color="var(--success)" />
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Réponse de l'équipe</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.adminResponse}</p>
              </div>
            )}

            {selected.status !== 'résolu' && !selected.adminResponse && (
              <div style={{ marginBottom: 16, padding: '0.875rem 1rem', background: 'var(--warning-light)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={14} color="var(--warning)" />
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>En attente de réponse.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setDialogRec(selected)} className="btn-primary" style={{ flex: 1, gap: 8 }}>
                <ChevronDown size={14} /> Changer le statut
              </button>
              <button onClick={() => deleteRec(selected._id)} className="btn-danger" style={{ gap: 8 }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Client</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {selected.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{selected.user?.username}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selected.user?.email && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={11} /> {selected.user.email}
                      </p>
                    )}
                    {selected.user?.phone && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} /> {selected.user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Date de soumission', value: new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                  { label: 'Statut actuel', value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1), icon: StatusIcon },
                  { label: 'Référence', value: '#' + selected._id?.slice(-8).toUpperCase(), icon: Hash },
                  { label: 'Sujet', value: selected.subject, icon: FileText },
                  ...(selected.contactValue ? [{ label: `Contact préféré (${selected.contactPreference === 'phone' ? 'Téléphone' : 'Email'})`, value: selected.contactValue, icon: selected.contactPreference === 'phone' ? Phone : Mail }] : []),
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color="var(--text-3)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images card */}
            {selected.images && selected.images.length > 0 && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Pièces jointes ({selected.images.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selected.images.map((img, i) => {
                    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(img);
                    return (
                      <a key={i} href={`${API_BASE}/uploads/${img}`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, background: isImg ? 'transparent' : 'var(--surface-2)', textDecoration: 'none' }}>
                        {isImg
                          ? <img src={`${API_BASE}/uploads/${img}`} alt={`img-${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <>
                              <FileText size={26} color="var(--primary)" />
                              <span style={{ fontSize: 9, color: 'var(--text-2)', marginTop: 4, textAlign: 'center', padding: '0 4px', wordBreak: 'break-all', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {img.split('-').slice(2).join('-') || img}
                              </span>
                            </>
                        }
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Statut du traitement</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--${cfg})`, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {selected.status === 'résolu' ? 'Cette réclamation a été résolue.' : selected.adminResponse ? 'Une réponse a été envoyée au client.' : "Aucune réponse envoyée pour l'instant."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {dialogRec && <StatusDialog reclamation={dialogRec} onClose={() => setDialogRec(null)} onSave={saveStatus} />}

      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Réclamations</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez les demandes et réclamations clients</p>
      </div>


      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total réclamations', value: reclamations.length, icon: MessageSquare, color: 'primary', bg: 'var(--primary-light)' },
          { label: 'En attente', value: reclamations.filter(r => r.status === 'en attente').length, icon: Clock, color: 'warning', bg: 'var(--warning-light)' },
          { label: 'En cours', value: reclamations.filter(r => r.status === 'en cours').length, icon: Headphones, color: 'info', bg: 'var(--info-light)' },
          { label: 'Résolues', value: reclamations.filter(r => r.status === 'résolu').length, icon: CheckCircle, color: 'success', bg: 'var(--success-light)' },
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'badge-primary' : 'badge-gray'} style={{ padding: '0.5rem 1rem', fontSize: 13, cursor: 'pointer' }}>
              {s === 'tous' ? 'Toutes' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>({reclamations.filter(r => s === 'tous' || r.status === s).length})</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
          <Search size={16} color="var(--text-3)" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, width: 200 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MessageSquare size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucune réclamation</h3>
          <p style={{ color: 'var(--text-2)' }}>Aucune réclamation ne correspond à vos critères</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r, i) => {
            const cfg = statusColors[r.status] || 'warning';
            const StatusIcon = statusIcons[r.status] || Clock;
            return (
              <div key={r._id} className="card hover-lift"
                style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.05}s`, borderLeft: `3px solid var(--${cfg})` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--${cfg}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon size={16} color={`var(--${cfg})`} />
                </div>
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedId(r._id)}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{r.user?.username}</span>
                    {r.user?.email && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Mail size={10} /> {r.user.email}
                      </span>
                    )}
                    {r.user?.phone && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={10} /> {r.user.phone}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>#{r._id?.slice(-6).toUpperCase()}</span>
                    {r.adminResponse && (
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle size={11} /> Répondu
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={r.status} size="sm" />
                <button
                  onClick={(e) => { e.stopPropagation(); setDialogRec(r); }}
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: 11, gap: 5, flexShrink: 0 }}
                >
                  <ChevronDown size={12} /> Statut
                </button>
                <Eye size={15} color="var(--text-3)" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setSelectedId(r._id)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
