'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FileText, Trash2, X, CheckCircle, Clock, XCircle, Car,
  HeartPulse, Plane, Search, Eye, Shield, Banknote, Wifi,
  Building2, TrendingUp, ChevronDown, ChevronUp, User,
  Calendar, Gauge, Settings, Lock, Heart, Activity, Globe,
  CreditCard, Send, Download, PenLine, Upload as UploadIcon
} from 'lucide-react';
import api from '../../../lib/api';
import { generateContractPDF } from '../../../lib/generateContractPDF';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || 'http://localhost:5000';

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: '#FF8B00',        bg: 'rgba(255,139,0,0.12)' },
  approved: { label: 'Approuvé',   color: 'var(--success)', bg: 'var(--success-light)' },
  active:   { label: 'Actif',      color: '#00875A',        bg: 'var(--success-light)' },
  rejected: { label: 'Rejeté',     color: 'var(--danger)',  bg: 'var(--danger-light)' },
};

const TYPE_CONFIG = {
  Auto: { icon: Car,        color: 'primary', label: 'Automobile' },
  Vie:  { icon: HeartPulse, color: 'success', label: 'Vie' },
  Vol:  { icon: Plane,      color: 'accent',  label: 'Voyage' },
};

// ── Shared row / section components (same as client detail) ───
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SectionBlock({ title, icon: Icon, color = 'primary', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color={`var(--${color})`} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        </div>
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </button>
      {open && <div style={{ padding: '4px 14px 12px' }}>{children}</div>}
    </div>
  );
}

function AutoDetails({ d }) {
  if (!d) return null;
  return (
    <>
      <SectionBlock title="Véhicule" icon={Car} color="primary" defaultOpen>
        <InfoRow label="Modèle" value={d.modele} />
        <InfoRow label="Finition" value={d.finition} />
        <InfoRow label="Valeur vénale" value={d.valeurVenale ? `${Number(d.valeurVenale).toLocaleString()} DT` : null} />
        <InfoRow label="Valeur à neuf" value={d.valeurNeuf ? `${Number(d.valeurNeuf).toLocaleString()} DT` : null} />
        <InfoRow label="Kilométrage" value={d.kilometrage ? `${Number(d.kilometrage).toLocaleString()} km` : null} />
        <InfoRow label="Boîte de vitesse" value={d.boiteVitesse} />
        <InfoRow label="Nb portes" value={d.nbPortes} />
        <InfoRow label="Stationnement" value={d.typeStationnement} />
      </SectionBlock>
      <SectionBlock title="Équipements" icon={Settings} color="primary">
        <InfoRow label="Radar de recul" value={d.radarRecul ? 'Oui' : 'Non'} />
        <InfoRow label="Alarme" value={d.alarme ? 'Oui' : 'Non'} />
        <InfoRow label="GPS" value={d.gps ? 'Oui' : 'Non'} />
        <InfoRow label="ABS" value={d.abs ? 'Oui' : 'Non'} />
        <InfoRow label="Airbags" value={d.airbags ? 'Oui' : 'Non'} />
      </SectionBlock>
      <SectionBlock title="Permis de conduire" icon={Lock} color="primary">
        <InfoRow label="Type" value={d.typePermis} />
        <InfoRow label="Catégorie" value={d.categoriePermis} />
        <InfoRow label="Numéro" value={d.numPermis} />
        <InfoRow label="Date d'obtention" value={d.dateObtentionPermis ? new Date(d.dateObtentionPermis).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="Autre conducteur" value={d.autreConduct ? 'Oui' : 'Non'} />
      </SectionBlock>
    </>
  );
}

function VieDetails({ d }) {
  if (!d) return null;
  return (
    <>
      <SectionBlock title="Prêt" icon={CreditCard} color="success" defaultOpen>
        <InfoRow label="Assuré" value={`${d.prenomAssure || ''} ${d.nomAssure || ''}`.trim()} />
        <InfoRow label="Date de naissance" value={d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="GSM" value={d.gsm} />
        <InfoRow label="Email" value={d.email} />
        <InfoRow label="Capital" value={d.capitalEmprunte ? `${Number(d.capitalEmprunte).toLocaleString()} DT` : null} />
        <InfoRow label="Taux" value={d.tauxInteret !== undefined ? `${d.tauxInteret}%` : null} />
        <InfoRow label="Durée" value={d.dureeRemboursement ? `${d.dureeRemboursement} mois` : null} />
        <InfoRow label="Franchise" value={d.periodeFranchise ? `${d.periodeFranchise} mois` : null} />
        <InfoRow label="Périodicité" value={d.periodicite} />
        <InfoRow label="Banque" value={d.organismePreteur} />
        <InfoRow label="Début d'effet" value={d.dateDebutEffet ? new Date(d.dateDebutEffet).toLocaleDateString('fr-FR') : null} />
      </SectionBlock>
      <SectionBlock title="Santé" icon={Heart} color="success">
        <InfoRow label="Âge" value={d.age ? `${d.age} ans` : null} />
        <InfoRow label="Taille / Poids" value={d.taille && d.poids ? `${d.taille} cm / ${d.poids} kg` : null} />
        <InfoRow label="État de santé" value={d.etatSante} />
        <InfoRow label="Fumeur" value={d.fumeur ? 'Oui' : 'Non'} />
        <InfoRow label="Sport à risque" value={d.sportRisque ? 'Oui' : 'Non'} />
        <InfoRow label="Maladies chroniques" value={d.maladiesChroniques ? 'Oui' : 'Non'} />
        {d.maladiesChroniques && <InfoRow label="Détails" value={d.detailsMaladies} />}
        <InfoRow label="Opérations chirurgicales" value={d.operationsChirurgicales ? 'Oui' : 'Non'} />
        <InfoRow label="Médicaments réguliers" value={d.medicamentsRegulier ? 'Oui' : 'Non'} />
        <InfoRow label="Maladies graves" value={d.maladiesGraves ? 'Oui' : 'Non'} />
        <InfoRow label="Hospitalisations" value={d.hospitalise ? 'Oui' : 'Non'} />
        <InfoRow label="Suivi spécialiste" value={d.suiviSpecialiste ? 'Oui' : 'Non'} />
        <InfoRow label="Maladies héréditaires" value={d.maladiesHereditaires ? 'Oui' : 'Non'} />
        {d.maladiesHereditaires && <InfoRow label="Détails hérédité" value={d.detailsHereditaires} />}
      </SectionBlock>
    </>
  );
}

function VolDetails({ d }) {
  if (!d) return null;
  return (
    <SectionBlock title="Voyage" icon={Globe} color="accent" defaultOpen>
      <InfoRow label="Voyageur" value={`${d.prenom || ''} ${d.nom || ''}`.trim()} />
      <InfoRow label="Date de naissance" value={d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : null} />
      <InfoRow label="Destination" value={d.destination} />
      <InfoRow label="Type de voyage" value={d.typeVoyage} />
      <InfoRow label="Voyageant" value={d.voyageAvec} />
      <InfoRow label="Type voyageur" value={Array.isArray(d.typeVoyageur) ? d.typeVoyageur.join(', ') : d.typeVoyageur} />
      <InfoRow label="Départ" value={d.dateDepart ? new Date(d.dateDepart).toLocaleDateString('fr-FR') : null} />
      <InfoRow label="Retour" value={d.dateRetour ? new Date(d.dateRetour).toLocaleDateString('fr-FR') : null} />
    </SectionBlock>
  );
}

// ── Contract modal ─────────────────────────────────────────────
function ContractModal({ contract, onClose, onRefresh }) {
  const [status, setStatus] = useState(contract.status === 'active' ? 'approved' : contract.status);
  const [note, setNote] = useState(contract.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [validatingCash, setValidatingCash] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cfg = TYPE_CONFIG[contract.type] || TYPE_CONFIG.Auto;
  const Icon = cfg.icon;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/contracts/${contract._id}`, { status, adminNote: note });
      toast.success('Statut mis à jour');
      onRefresh(); onClose();
    } catch { toast.error('Erreur'); } finally { setSaving(false); }
  };

  const handleValidateCash = async () => {
    setValidatingCash(true);
    try {
      await api.post(`/contracts/${contract._id}/validate-cash`);
      toast.success('Paiement cash validé — contrat activé');
      onRefresh(); onClose();
    } catch { toast.error('Erreur'); } finally { setValidatingCash(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateContractPDF(contract);
    } catch { toast.error('Erreur PDF'); } finally { setDownloading(false); }
  };

  const docs = contract.documents || [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ maxWidth: 720, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `var(--${cfg.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={`var(--${cfg.color})`} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Assurance {cfg.label}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>{contract.numeroContrat}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {contract.status === 'active' && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                title="Télécharger contrat PDF"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: downloading ? 0.6 : 1 }}
              >
                {downloading ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Download size={14} />}
                Télécharger PDF
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              <X size={20} color="var(--text-3)" />
            </button>
          </div>
        </div>

        {/* Client + contract summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface)', borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase' }}>Client</p>
            <p style={{ fontSize: 14, fontWeight: 700 }}>{contract.user?.username || '—'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{contract.user?.email}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{contract.user?.phone}</p>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface)', borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase' }}>Contrat</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>{(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {contract.dossierSubmitted ? '✅ Dossier soumis' : '⏳ Dossier en cours'}
              {' · '}Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Paiement : {contract.paymentStatus === 'paid' ? `✓ Payé (${contract.paymentMethod === 'cash' ? 'cash' : 'ligne'})` : contract.paymentStatus === 'pending_cash' ? '⏳ Cash att.' : 'Non payé'}
            </p>
          </div>
        </div>

        {/* Full souscription data */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Informations de souscription
          </p>
          {contract.type === 'Auto' && <AutoDetails d={contract.autoData} />}
          {contract.type === 'Vie' && <VieDetails d={contract.vieData} />}
          {contract.type === 'Vol' && <VolDetails d={contract.volData} />}
        </div>

        {/* Documents */}
        {docs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Documents fournis ({docs.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {docs.map(doc => (
                <div key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 9 }}>
                  <CheckCircle size={13} color="var(--success)" />
                  <p style={{ fontSize: 12, flex: 1, fontWeight: 500 }}>{doc.label}</p>
                  <a href={`${API_BASE}${doc.url}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: 'white', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text-2)', textDecoration: 'none' }}>
                    <Eye size={11} /> Voir
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cash payment validation */}
        {contract.paymentStatus === 'pending_cash' && (
          <div style={{ padding: '14px 16px', background: 'rgba(255,139,0,0.08)', border: '2px solid #FF8B00', borderRadius: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Building2 size={18} color="#FF8B00" />
              <p style={{ fontWeight: 700, color: '#FF8B00' }}>Paiement cash en attente</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
              Le client souhaite payer <strong>{(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT</strong> en espèces.
            </p>
            <button onClick={handleValidateCash} disabled={validatingCash} className="btn-primary" style={{ gap: 6, background: '#FF8B00' }}>
              {validatingCash ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <CheckCircle size={13} />}
              Valider le paiement cash
            </button>
          </div>
        )}

        {/* Status change — only pending / approved / rejected */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Modifier le statut</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { value: 'pending',  label: 'En attente', color: '#FF8B00',        bg: 'rgba(255,139,0,0.12)' },
              { value: 'approved', label: 'Approuvé',   color: 'var(--success)', bg: 'var(--success-light)' },
              { value: 'rejected', label: 'Rejeté',     color: 'var(--danger)',  bg: 'var(--danger-light)' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setStatus(opt.value)} style={{
                padding: '0.45rem 1.1rem', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                fontWeight: status === opt.value ? 700 : 400,
                background: status === opt.value ? opt.bg : 'var(--surface)',
                color: status === opt.value ? opt.color : 'var(--text-2)',
                border: `2px solid ${status === opt.value ? opt.color : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>{opt.label}</button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Note pour le client</label>
            <textarea className="input-field" rows={2} placeholder="Message visible par le client..." value={note}
              onChange={e => setNote(e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, gap: 6 }}>
              {saving ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <CheckCircle size={13} />}
              Enregistrer
            </button>
            <button onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────
export default function AdminContrats() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [adminSig, setAdminSig] = useState(null);
  const [sigUploading, setSigUploading] = useState(false);
  const adminSigInputRef = useRef(null);

  const fetchAdminSig = async () => {
    try { const { data } = await api.get('/signature/admin'); setAdminSig(data.signature); } catch {}
  };

  const handleAdminSigUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSigUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/signature/admin', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAdminSig(data.signature);
      toast.success('Signature admin enregistrée !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload signature');
    } finally {
      setSigUploading(false);
    }
  };

  const handleDownload = async (contract) => {
    setDownloading(contract._id);
    try {
      await generateContractPDF(contract);
    } catch (err) {
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setDownloading(null);
    }
  };

  const fetchContracts = async () => {
    try { const { data } = await api.get('/contracts'); setContracts(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchContracts(); fetchAdminSig(); }, []);

  const deleteContract = async (id) => {
    if (!confirm('Supprimer ce contrat ?')) return;
    try { await api.delete(`/contracts/${id}`); toast.success('Supprimé'); fetchContracts(); }
    catch { toast.error('Erreur'); }
  };

  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => c.status === 'pending').length,
    approved: contracts.filter(c => c.status === 'approved').length,
    active: contracts.filter(c => c.status === 'active').length,
    cashPending: contracts.filter(c => c.paymentStatus === 'pending_cash').length,
    revenue: contracts.filter(c => c.paymentStatus === 'paid').reduce((s, c) => s + (c.price || 0), 0),
    // Dossiers submitted and waiting review
    dossierWaiting: contracts.filter(c => c.dossierSubmitted && c.status === 'pending').length,
  };

  const filtered = contracts.filter(c => {
    // Only show contracts where client has submitted the complete dossier
    if (!c.dossierSubmitted) return false;
    if (filter !== 'tous' && c.status !== filter) return false;
    if (typeFilter !== 'tous' && c.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.numeroContrat?.toLowerCase().includes(s) ||
             c.user?.username?.toLowerCase().includes(s) ||
             c.user?.email?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gestion</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Souscriptions & Contrats</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Consultez les dossiers et validez les contrats</p>
      </div>

      {/* Alert: dossiers waiting for review */}
      {stats.dossierWaiting > 0 && (
        <div style={{ padding: '14px 20px', background: 'rgba(255,139,0,0.08)', border: '1px solid #FF8B00', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Send size={18} color="#FF8B00" />
            <p style={{ fontWeight: 700, color: '#FF8B00' }}>
              {stats.dossierWaiting} dossier{stats.dossierWaiting > 1 ? 's' : ''} soumis en attente de votre examen
            </p>
          </div>
        </div>
      )}

      {/* Admin Signature Panel */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenLine size={17} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700 }}>Signature électronique SmartAssur</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {adminSig ? 'Signature enregistrée — appliquée automatiquement sur tous les contrats' : 'Aucune signature — uploadez votre signature officielle'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {adminSig && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: '#fafafa', padding: '6px 10px' }}>
                <img src={adminSig} alt="Signature admin" style={{ maxHeight: 50, maxWidth: 180 }} />
              </div>
            )}
            <input ref={adminSigInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleAdminSigUpload} />
            <button
              onClick={() => adminSigInputRef.current?.click()}
              disabled={sigUploading}
              className={adminSig ? 'btn-outline' : 'btn-primary'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {sigUploading ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <UploadIcon size={14} />}
              {adminSig ? 'Remplacer la signature' : 'Uploader ma signature'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total',      value: stats.total,    icon: FileText, color: 'primary' },
          { label: 'En attente', value: stats.pending,  icon: Clock,    color: 'warning' },
          { label: 'Approuvés',  value: stats.approved, icon: CheckCircle, color: 'success' },
          { label: 'Actifs',     value: stats.active,   icon: Shield,   color: 'success' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ padding: '0.875rem', animationDelay: `${i * 0.04}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--${s.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={`var(--${s.color})`} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['tous', 'pending', 'approved', 'active', 'rejected'].map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.35rem 0.875rem', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                fontWeight: filter === s ? 700 : 400,
                background: filter === s ? (cfg?.bg || 'var(--primary-light)') : 'var(--surface)',
                color: filter === s ? (cfg?.color || 'var(--primary)') : 'var(--text-2)',
                border: `1px solid ${filter === s ? (cfg?.color || 'var(--primary)') : 'var(--border)'}`,
              }}>
                {s === 'tous' ? 'Tous' : cfg?.label}
                {' '}({s === 'tous' ? contracts.filter(c => c.dossierSubmitted).length : contracts.filter(c => c.status === s && c.dossierSubmitted).length})
              </button>
            );
          })}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          {['tous', 'Auto', 'Vie', 'Vol'].map(t => {
            const cfg = t !== 'tous' ? TYPE_CONFIG[t] : null;
            return (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '0.35rem 0.875rem', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                fontWeight: typeFilter === t ? 700 : 400,
                background: typeFilter === t ? `var(--${cfg?.color || 'primary'}-light)` : 'var(--surface)',
                color: typeFilter === t ? `var(--${cfg?.color || 'primary'})` : 'var(--text-2)',
                border: `1px solid ${typeFilter === t ? `var(--${cfg?.color || 'primary'})` : 'var(--border)'}`,
              }}>
                {t === 'tous' ? 'Tous types' : cfg?.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem 1rem' }}>
          <Search size={14} color="var(--text-3)" />
          <input type="text" placeholder="Client, N° contrat..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 200 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['N° Contrat','Type','Client','Prime','Statut','Paiement','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>Aucun contrat</td></tr>
                ) : filtered.map(c => {
                  const typeCfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.Auto;
                  const Icon = typeCfg.icon;
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px' }}>
                        <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary)' }}>{c.numeroContrat?.slice(0, 16) || '—'}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: `var(--${typeCfg.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={13} color={`var(--${typeCfg.color})`} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{typeCfg.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{c.user?.username || '—'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.user?.email}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{(c.price || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.7rem', borderRadius: 99, background: statusCfg.bg, color: statusCfg.color, fontSize: 11, fontWeight: 600 }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {c.paymentStatus === 'paid' ? (
                          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Payé</span>
                        ) : c.paymentStatus === 'pending_cash' ? (
                          <span style={{ fontSize: 11, color: '#FF8B00', fontWeight: 600 }}>⏳ Cash</span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelected(c)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            <Eye size={13} /> Gérer
                          </button>
                          {c.status === 'active' && (
                            <button
                              onClick={() => handleDownload(c)}
                              disabled={downloading === c._id}
                              title="Télécharger le contrat PDF"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--success-light)', color: 'var(--success)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: downloading === c._id ? 0.6 : 1 }}
                            >
                              {downloading === c._id
                                ? <span className="spinner" style={{ width: 12, height: 12 }} />
                                : <Download size={13} />}
                              PDF
                            </button>
                          )}
                          <button onClick={() => deleteContract(c._id)} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <ContractModal contract={selected} onClose={() => setSelected(null)} onRefresh={fetchContracts} />}
    </div>
  );
}
