'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, X, MessageSquare, Send, CheckCircle, AlertCircle, 
  Clock, Headphones, Shield, ArrowLeft, Search,
  FileText, Calendar, ChevronRight, Edit2, Image, Phone, Mail, Upload
} from 'lucide-react';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

const statusConfig = { 
  'en attente': { color: 'warning', icon: Clock,       gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'en cours':   { color: 'info',    icon: Headphones,  gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  'résolu':     { color: 'success', icon: CheckCircle, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
};

function ContactField({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Comment vous contacter si besoin ?</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[
          { val: 'email', icon: Mail, label: 'Email' },
          { val: 'phone', icon: Phone, label: 'Téléphone' },
        ].map(opt => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange({ ...value, contactPreference: opt.val })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.875rem', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              border: `2px solid ${value.contactPreference === opt.val ? 'var(--primary)' : 'var(--border)'}`,
              background: value.contactPreference === opt.val ? 'var(--primary-light)' : 'var(--surface)',
              color: value.contactPreference === opt.val ? 'var(--primary)' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            <opt.icon size={14} /> {opt.label}
          </button>
        ))}
      </div>
      <input
        type={value.contactPreference === 'email' ? 'email' : 'tel'}
        className="input-field"
        placeholder={value.contactPreference === 'email' ? 'votre@email.com' : '+216 XX XXX XXX'}
        value={value.contactValue}
        onChange={(e) => onChange({ ...value, contactValue: e.target.value })}
      />
    </div>
  );
}

const emptyForm = () => ({ subject: '', description: '', contactPreference: 'email', contactValue: '', images: [], previews: [] });

export default function ReclamationsPage() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [editForm, setEditForm] = useState({ subject: '', description: '', contactPreference: 'email', contactValue: '', images: [], newImages: [], filesToRemove: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fileInputRef = useRef();
  const editFileInputRef = useRef();

  const openEdit = (rec) => {
    setEditForm({
      subject: rec.subject,
      description: rec.description,
      contactPreference: rec.contactPreference || 'email',
      contactValue: rec.contactValue || '',
      images: rec.images || [],
      newImages: [],
      filesToRemove: [],
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.subject || !editForm.description) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('subject', editForm.subject);
      fd.append('description', editForm.description);
      fd.append('contactPreference', editForm.contactPreference);
      fd.append('contactValue', editForm.contactValue);
      if (editForm.filesToRemove.length > 0) {
        fd.append('filesToRemove', JSON.stringify(editForm.filesToRemove));
      }
      editForm.newImages.forEach(f => fd.append('images', f));
      await api.patch(`/reclamations/${selectedId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Réclamation modifiée avec succès !');
      setShowEditModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchAll = async () => {
    try { 
      const { data } = await api.get('/reclamations'); 
      setReclamations(data);
    } catch (err) {
      console.error('Error fetching reclamations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('subject', form.subject);
      fd.append('description', form.description);
      fd.append('contactPreference', form.contactPreference);
      fd.append('contactValue', form.contactValue);
      form.images.forEach(f => fd.append('images', f));
      await api.post('/reclamations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Réclamation soumise avec succès !');
      setShowForm(false);
      setForm(emptyForm());
      fetchAll();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReclamations = reclamations.filter(r => {
    if (filter !== 'tous' && r.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.subject?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const selected = reclamations.find(r => r._id === selectedId);

  const stats = {
    total: reclamations.length,
    enAttente: reclamations.filter(r => r.status === 'en attente').length,
    enCours: reclamations.filter(r => r.status === 'en cours').length,
    resolu: reclamations.filter(r => r.status === 'résolu').length,
  };

  // --- DETAIL VIEW ---
  if (selected) {
    const cfg = statusConfig[selected.status] || statusConfig['en attente'];
    const StatusIcon = cfg.icon;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: 0 }}
          >
            <ArrowLeft size={16} /> Retour aux réclamations
          </button>
          {selected.status === 'en attente' && (
            <button onClick={() => openEdit(selected)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Edit2 size={14} /> Modifier
            </button>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="card" style={{ maxWidth: 560, width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Modifier la réclamation</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Modification possible tant que le statut est "en attente"</p>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6 }}><X size={18} /></button>
              </div>
              <form onSubmit={handleEdit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Sujet <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" required className="input-field" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <textarea required rows={4} className="input-field" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ resize: 'vertical' }} />
                  </div>
                  <ContactField
                    value={{ contactPreference: editForm.contactPreference, contactValue: editForm.contactValue }}
                    onChange={(v) => setEditForm({ ...editForm, contactPreference: v.contactPreference, contactValue: v.contactValue })}
                  />
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Fichiers joints</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {editForm.images.filter(img => !editForm.filesToRemove.includes(img)).map((img, i) => {
                        const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(img);
                        return (
                          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: isImg ? 'transparent' : 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {isImg
                              ? <img src={`${API_BASE}/uploads/${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <>
                                  <FileText size={28} color="var(--primary)" />
                                  <span style={{ fontSize: 9, color: 'var(--text-2)', textAlign: 'center', padding: '0 4px', marginTop: 4, lineHeight: 1.2, wordBreak: 'break-all', maxWidth: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {img.split('-').slice(2).join('-') || img}
                                  </span>
                                </>
                            }
                            <button type="button" onClick={() => setEditForm(f => ({ ...f, filesToRemove: [...f.filesToRemove, img] }))}
                              style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,53,69,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: 0 }}>
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}
                      {editForm.newImages.map((f, i) => {
                        const isImg = f.type.startsWith('image/');
                        return (
                          <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--primary)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {isImg
                              ? <img src={(editForm.newPreviews || [])[i]} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <>
                                  <FileText size={28} color="var(--primary)" />
                                  <span style={{ fontSize: 9, color: 'var(--text-2)', textAlign: 'center', padding: '0 4px', marginTop: 4, lineHeight: 1.2, wordBreak: 'break-all', maxWidth: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{f.name}</span>
                                </>
                            }
                            <button type="button" onClick={() => setEditForm(ef => ({ ...ef, newImages: ef.newImages.filter((_, j) => j !== i), newPreviews: (ef.newPreviews || []).filter((_, j) => j !== i) }))}
                            style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,53,69,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: 0 }}>
                            <X size={11} />
                          </button>
                        </div>
                        );
                      })}
                    </div>
                    <input ref={editFileInputRef} type="file" multiple accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }}
                      onChange={(e) => { const files = Array.from(e.target.files); if (files.length) { const urls = files.map(f => URL.createObjectURL(f)); setEditForm(ef => ({ ...ef, newImages: [...ef.newImages, ...files], newPreviews: [...(ef.newPreviews || []), ...urls] })); } e.target.value = ''; }} />
                    <button type="button" onClick={() => editFileInputRef.current?.click()}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', background: 'var(--primary-light)', border: '1px dashed var(--primary)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 500 }}>
                      <Upload size={13} /> Ajouter des fichiers
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={editSubmitting} className="btn-primary" style={{ flex: 1, gap: 8, opacity: editSubmitting ? 0.7 : 1 }}>
                      <Send size={14} /> {editSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>Annuler</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: cfg.gradient, padding: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selected.subject}</h2>
                  <span style={{ fontSize: 12, opacity: 0.85, fontFamily: 'monospace' }}>Réf. #{selected._id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
              <StatusBadge status={selected.status} size="lg" />
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Date de soumission</p>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon size={16} color={`var(--${cfg.color})`} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Statut</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: `var(--${cfg.color})` }}>{selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</p>
                </div>
              </div>
              {selected.contactValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selected.contactPreference === 'phone' ? <Phone size={16} color="var(--primary)" /> : <Mail size={16} color="var(--primary)" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Contact préféré ({selected.contactPreference === 'phone' ? 'Téléphone' : 'Email'})</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{selected.contactValue}</p>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Référence</p>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>#{selected._id?.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MessageSquare size={16} color="var(--primary)" />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Votre message</p>
              </div>
              <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
            </div>

            {/* Images */}
            {selected.images && selected.images.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Image size={16} color="var(--primary)" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pièces jointes ({selected.images.length})</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {selected.images.map((img, i) => {
                    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(img);
                    return (
                      <a key={i} href={`${API_BASE}/uploads/${img}`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: isImg ? 'transparent' : 'var(--surface-2)', textDecoration: 'none' }}>
                        {isImg
                          ? <img src={`${API_BASE}/uploads/${img}`} alt={`pj-${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <>
                              <FileText size={32} color="var(--primary)" />
                              <span style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 6, textAlign: 'center', padding: '0 6px', wordBreak: 'break-all', lineHeight: 1.2 }}>{img.split('-').slice(2).join('-') || img}</span>
                            </>
                        }
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Response */}
            {selected.adminResponse && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Shield size={16} color="var(--success)" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Réponse de l'équipe SmartAssur</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--success-light)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.adminResponse}</p>
                </div>
              </div>
            )}

            {selected.status !== 'résolu' && !selected.adminResponse && (
              <div style={{ padding: '1rem 1.25rem', background: 'var(--warning-light)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={18} color="var(--warning)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 2 }}>En attente de réponse</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Notre équipe support traite votre demande et vous répondra dans les plus brefs délais.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={14} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support client</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', marginBottom: 4 }}>Mes Réclamations</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Suivez et gérez vos demandes d'assistance</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ gap: 8 }}>
            <Plus size={15} /> Nouvelle réclamation
          </button>
        </div>
      </div>

      {reclamations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total réclamations', value: stats.total, icon: MessageSquare, color: 'primary' },
            { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'warning' },
            { label: 'En cours', value: stats.enCours, icon: Headphones, color: 'info' },
            { label: 'Résolues', value: stats.resolu, icon: CheckCircle, color: 'success' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="stat-card" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${stat.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={20} color={`var(--${stat.color})`} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{stat.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: `var(--${stat.color})` }}>{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reclamations.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['tous', 'en attente', 'en cours', 'résolu'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 0.875rem', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === s ? 'var(--primary)' : 'var(--surface)',
                color: filter === s ? 'white' : 'var(--text-2)', transition: 'all 0.15s',
              }}>
                {s === 'tous' ? 'Toutes' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span style={{ marginLeft: 5, opacity: 0.7 }}>({reclamations.filter(r => s === 'tous' || r.status === s).length})</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem 0.875rem' }}>
            <Search size={14} color="var(--text-3)" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 150, color: 'var(--text)' }} />
          </div>
        </div>
      )}

      {/* New Reclamation Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 560, width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Nouvelle réclamation</h2>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Décrivez votre problème et nous vous répondrons rapidement</p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(emptyForm()); }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Sujet <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="text" required className="input-field" placeholder="Ex: Problème de paiement, Question sur mon contrat..."
                    value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea required rows={4} className="input-field" placeholder="Décrivez votre réclamation en détail..."
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <ContactField
                  value={{ contactPreference: form.contactPreference, contactValue: form.contactValue }}
                  onChange={(v) => setForm({ ...form, contactPreference: v.contactPreference, contactValue: v.contactValue })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Pièces jointes <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optionnel)</span>
                  </label>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }}
                    onChange={(e) => { const files = Array.from(e.target.files); if (files.length) { const urls = files.map(f => URL.createObjectURL(f)); setForm(prev => ({ ...prev, images: [...prev.images, ...files], previews: [...prev.previews, ...urls] })); } e.target.value = ''; }} />
                  {form.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {form.images.map((file, i) => {
                        const isImg = file.type.startsWith('image/');
                        return (
                          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {isImg
                              ? <img src={form.previews[i]} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <>
                                  <FileText size={28} color="var(--primary)" />
                                  <span style={{ fontSize: 9, color: 'var(--text-2)', textAlign: 'center', padding: '0 4px', marginTop: 4, lineHeight: 1.2, wordBreak: 'break-all', maxWidth: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{file.name}</span>
                                </>
                            }
                            <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i), previews: f.previews.filter((_, j) => j !== i) }))}
                              style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,53,69,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: 0 }}>
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.75rem', borderRadius: 10, border: '2px dashed var(--border)', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, justifyContent: 'center', transition: 'all 0.15s' }}>
                      <Upload size={16} /> Ajouter des fichiers
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, gap: 8, opacity: submitting ? 0.7 : 1 }}>
                    <Send size={14} /> {submitting ? 'Envoi...' : 'Soumettre'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setForm(emptyForm()); }} style={{ flex: 1 }}>Annuler</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
      ) : reclamations.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageSquare size={32} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 6 }}>Aucune réclamation</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, fontSize: 13 }}>Notre équipe est là pour vous aider en cas de besoin.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ gap: 8 }}><Plus size={14} /> Créer une réclamation</button>
        </div>
      ) : filteredReclamations.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Search size={36} color="var(--text-3)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Aucune réclamation ne correspond à vos critères</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredReclamations.map((rec, i) => {
            const cfg = statusConfig[rec.status] || statusConfig['en attente'];
            return (
              <div key={rec._id} className="card hover-lift" onClick={() => setSelectedId(rec._id)}
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', animationDelay: `${i * 0.05}s` }}>
                <div style={{ background: cfg.gradient, padding: '1.25rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.subject}</p>
                      <p style={{ fontSize: 11, opacity: 0.85 }}>Réf. #{rec._id?.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {rec.adminResponse && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '0.25rem 0.75rem', fontSize: 11, fontWeight: 600 }}>
                        <CheckCircle size={11} /> Répondu
                      </div>
                    )}
                    {rec.images && rec.images.length > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '0.25rem 0.75rem', fontSize: 11, fontWeight: 600 }}>
                        <Image size={11} /> {rec.images.length} photo{rec.images.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '1.125rem' }}>
                  <div style={{ marginBottom: 12 }}><StatusBadge status={rec.status} size="md" /></div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {rec.description}
                  </p>
                  {rec.contactValue && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
                      {rec.contactPreference === 'phone' ? <Phone size={12} /> : <Mail size={12} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.contactValue}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                      <Calendar size={13} />
                      {new Date(rec.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {rec.status === 'en attente' && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedId(rec._id); setTimeout(() => openEdit(rec), 0); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--warning)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Edit2 size={12} /> Modifier
                        </button>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                        Voir détails <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
