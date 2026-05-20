'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle, X, Save, Search, FileText,
  Clock, CheckCircle, XCircle, Eye, ArrowLeft,
  Calendar, TrendingUp, Image as ImageIcon, MessageSquare, Hash, ChevronDown, Trash2, File, Mail, Phone
} from 'lucide-react';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

function StatusDialog({ claim, onClose, onSave }) {
  const [form, setForm] = useState({
    status: claim.status,
    adminComment: claim.adminComment || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(claim._id, form);
    setSaving(false);
  };

  const statusOptions = [
    { value: 'en attente', label: 'En attente',  color: 'var(--warning)', bg: 'var(--warning-light)' },
    { value: 'en cours',   label: 'En cours',     color: 'var(--info)',    bg: 'var(--info-light)'    },
    { value: 'approuvé',   label: 'Approuvé',     color: 'var(--success)', bg: 'var(--success-light)' },
    { value: 'refusé',     label: 'Refusé',       color: 'var(--danger)',  bg: 'var(--danger-light)'  },
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
                <AlertTriangle size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Traiter le sinistre</h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 46 }}>
              Sinistre #{claim._id?.slice(-8).toUpperCase()} — {claim.contract?.type || 'N/A'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Nouveau statut</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, status: opt.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${form.status === opt.value ? opt.color : 'var(--border)'}`,
                  background: form.status === opt.value ? opt.bg : 'var(--surface)',
                  transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: form.status === opt.value ? opt.color : 'var(--text-2)' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            Commentaire <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optionnel)</span>
          </label>
          <textarea
            rows={4} className="input-field"
            placeholder="Commentaire transmis au client..."
            value={form.adminComment}
            onChange={(e) => setForm({ ...form, adminComment: e.target.value })}
            style={{ resize: 'vertical', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, gap: 8, opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button onClick={onClose} className="btn-outline" style={{ flex: 1 }}>
            <X size={14} /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// Image Preview Modal Component
function ImagePreviewModal({ imageUrl, onClose }) {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.9)', 
      backdropFilter: 'blur(8px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 2000, 
      padding: '2rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{ 
        position: 'relative', 
        maxWidth: '90vw', 
        maxHeight: '90vh',
        backgroundColor: 'transparent'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={24} />
        </button>
        <img 
          src={imageUrl} 
          alt="Preview" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '90vh', 
            objectFit: 'contain',
            borderRadius: 12,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }} 
        />
      </div>
    </div>
  );
}

// File Item Component
function FileItem({ file, index, onImageClick, onPdfClick }) {
  const isPdf = file.toLowerCase().endsWith('.pdf');
  const fileUrl = `http://localhost:5000/uploads/${file}`;
  const fileName = file.length > 30 ? file.substring(0, 27) + '...' : file;

  if (isPdf) {
    return (
      <div 
        onClick={() => onPdfClick(fileUrl)}
        style={{
          width: 72,
          height: 72,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: 10,
          border: '1px solid var(--border)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'transform 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <File size={28} color="white" />
        <span style={{
          fontSize: 9,
          color: 'white',
          fontWeight: 600,
          position: 'absolute',
          bottom: 4,
          right: 6
        }}>
          PDF
        </span>
      </div>
    );
  }

  // For images
  return (
    <div style={{ position: 'relative' }}>
      <img 
        src={fileUrl}
        alt={`Justificatif ${index + 1}`}
        onClick={() => onImageClick(file)}
        style={{ 
          width: 72, 
          height: 72, 
          objectFit: 'cover', 
          borderRadius: 10, 
          border: '1px solid var(--border)', 
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(file);
        }}
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          borderRadius: 6,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: 'white',
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
      >
        <Eye size={10} />
        Voir
      </button>
    </div>
  );
}

export default function AdminSinistres() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dialogClaim, setDialogClaim] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchClaims = async () => {
    try { const { data } = await api.get('/claims'); setClaims(data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchClaims(); }, []);

  const saveStatus = async (id, form) => {
    try {
      await api.put(`/claims/${id}`, form);
      toast.success('Sinistre mis à jour');
      setDialogClaim(null);
      fetchClaims();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const openImagePreview = (imageName) => {
    setPreviewImage(`http://localhost:5000/uploads/${imageName}`);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const openPdfInNewTab = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  const STATUSES = ['tous', 'en attente', 'en cours', 'approuvé', 'refusé'];
  const statusColors = { 'en attente': 'warning', 'en cours': 'info', 'approuvé': 'success', 'refusé': 'danger' };
  const statusIcons = { 'en attente': Clock, 'en cours': TrendingUp, 'approuvé': CheckCircle, 'refusé': XCircle };

  const filtered = claims.filter(c => {
    if (filter !== 'tous' && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c._id?.toLowerCase().includes(s) ||
        c.user?.username?.toLowerCase().includes(s) ||
        c.contract?.type?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const selected = claims.find(c => c._id === selectedId);

  if (selected) {
    const cfg = statusColors[selected.status] || 'warning';
    const StatusIcon = statusIcons[selected.status] || Clock;

    return (
      <div>
        {dialogClaim && <StatusDialog claim={dialogClaim} onClose={() => setDialogClaim(null)} onSave={saveStatus} />}
        {previewImage && <ImagePreviewModal imageUrl={previewImage} onClose={closeImagePreview} />}

        <button onClick={() => setSelectedId(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Retour aux sinistres
        </button>

        <div className="animate-fade-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="var(--primary)" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Détail sinistre</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', marginBottom: 4 }}>Sinistre #{selected._id?.slice(-8).toUpperCase()}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Contrat : {selected.contract?.type || 'N/A'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)', borderLeft: `4px solid var(--${cfg})`, paddingLeft: 12, marginLeft: -12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `var(--${cfg}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} color={`var(--${cfg})`} />
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Sinistre #{selected._id?.slice(-8).toUpperCase()}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Contrat : {selected.contract?.type || 'N/A'}</p>
                </div>
              </div>
              <StatusBadge status={selected.status} size="md" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Description</p>
              <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
            </div>

            {selected.images?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Documents justificatifs ({selected.images.length})
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {selected.images.map((file, idx) => (
                    <FileItem 
                      key={idx}
                      file={file}
                      index={idx}
                      onImageClick={openImagePreview}
                      onPdfClick={openPdfInNewTab}
                    />
                  ))}
                </div>
              </div>
            )}

            {selected.adminComment && (
              <div style={{ marginBottom: 16, padding: '1rem', background: 'var(--info-light)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MessageSquare size={13} color="var(--info)" />
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--info)' }}>Commentaire de l'assureur</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selected.adminComment}</p>
              </div>
            )}

            {selected.status === 'en attente' && !selected.adminComment && (
              <div style={{ marginBottom: 16, padding: '0.875rem 1rem', background: 'var(--warning-light)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={14} color="var(--warning)" />
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>En attente de traitement.</p>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <button onClick={() => setDialogClaim(selected)} className="btn-primary" style={{ width: '100%', gap: 8 }}>
                <ChevronDown size={14} /> Changer le statut
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
                  { label: 'Date de déclaration', value: new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                  { label: 'Statut actuel', value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1), icon: StatusIcon },
                  { label: 'Contrat lié', value: selected.contract?.type || 'N/A', icon: FileText },
                  { label: 'Référence sinistre', value: '#' + selected._id?.slice(-8).toUpperCase(), icon: Hash },
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

            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Avancement</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--${cfg})`, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {selected.status === 'approuvé' && "Sinistre approuvé par l'assureur."}
                  {selected.status === 'refusé' && "Sinistre refusé par l'assureur."}
                  {selected.status === 'en cours' && "Dossier en cours d'instruction."}
                  {selected.status === 'en attente' && 'En attente de traitement.'}
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
      {dialogClaim && <StatusDialog claim={dialogClaim} onClose={() => setDialogClaim(null)} onSave={saveStatus} />}
      {previewImage && <ImagePreviewModal imageUrl={previewImage} onClose={closeImagePreview} />}

      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gestion des sinistres</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Sinistres</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez et traitez les déclarations de sinistres</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total sinistres', value: claims.length, icon: AlertTriangle, color: 'primary', bg: 'var(--primary-light)' },
          { label: 'En attente', value: claims.filter(c => c.status === 'en attente').length, icon: Clock, color: 'warning', bg: 'var(--warning-light)' },
          { label: 'En cours', value: claims.filter(c => c.status === 'en cours').length, icon: TrendingUp, color: 'info', bg: 'var(--info-light)' },
          { label: 'Approuvés', value: claims.filter(c => c.status === 'approuvé').length, icon: CheckCircle, color: 'success', bg: 'var(--success-light)' },
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
              {s === 'tous' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>({claims.filter(c => s === 'tous' || c.status === s).length})</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
          <Search size={16} color="var(--text-3)" />
          <input type="text" placeholder="Rechercher un sinistre..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, width: 220 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertTriangle size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun sinistre trouvé</h3>
          <p style={{ color: 'var(--text-2)' }}>Aucun sinistre ne correspond à vos critères</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c, i) => {
            const cfg = statusColors[c.status] || 'warning';
            const StatusIcon = statusIcons[c.status] || Clock;
            return (
              <div key={c._id} className="card hover-lift"
                style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.05}s`, borderLeft: `3px solid var(--${cfg})` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--${cfg}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon size={16} color={`var(--${cfg})`} />
                </div>
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedId(c._id)}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>#{c._id?.slice(-8).toUpperCase()}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{c.user?.username}</span>
                    {c.user?.email && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Mail size={10} /> {c.user.email}
                      </span>
                    )}
                    {c.user?.phone && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={10} /> {c.user.phone}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.contract?.type || 'N/A'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                    {c.images?.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FileText size={11} /> {c.images.length} fichier(s)
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={c.status} size="sm" />
                <button
                  onClick={(e) => { e.stopPropagation(); setDialogClaim(c); }}
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: 11, gap: 5, flexShrink: 0 }}
                >
                  <ChevronDown size={12} /> Statut
                </button>
                <Eye size={15} color="var(--text-3)" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setSelectedId(c._id)} />
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}