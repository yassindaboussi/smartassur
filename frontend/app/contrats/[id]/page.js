'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Upload, CheckCircle, Clock, XCircle, AlertCircle,
  FileText, Shield, Car, HeartPulse, Plane, CreditCard,
  Eye, Banknote, Wifi, Info, Building2, Send, RefreshCw,
  ChevronDown, ChevronUp, User, Calendar, Gauge, Settings,
  MapPin, Lock, Heart, Activity, Globe, PenLine, Trash2, Download
} from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';
import { generateContractPDF } from '../../../lib/generateContractPDF';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: '#FF8B00', bg: 'rgba(255,139,0,0.12)', icon: Clock },
  approved: { label: 'Approuvé',   color: 'var(--success)', bg: 'var(--success-light)', icon: CheckCircle },
  active:   { label: 'Actif',      color: 'var(--success)', bg: 'var(--success-light)', icon: Shield },
  rejected: { label: 'Rejeté',     color: 'var(--danger)',  bg: 'var(--danger-light)',  icon: XCircle },
};

const REQUIRED_DOCS = {
  Auto: [
    { name: 'cin',         label: 'Carte d\'identité nationale (CIN)',     required: true },
    { name: 'carte_sejour',label: 'Carte de séjour',                       required: false },
    { name: 'permis',      label: 'Permis de conduire',                    required: true },
    { name: 'carte_grise', label: 'Carte grise',                           required: true },
    { name: 'vignette',    label: 'Vignette',                              required: true },
    { name: 'visite_tech', label: 'Visite technique',                      required: true },
  ],
  Vie: [
    { name: 'cin',             label: 'Carte d\'identité nationale (CIN)',                                   required: true },
    { name: 'carte_sejour',    label: 'Carte de séjour',                                                     required: false },
    { name: 'justif_domicile', label: 'Justificatif de domicile (facture eau/gaz/élec ou attestation)',      required: true },
    { name: 'fiche_paie',      label: 'Fiche de paie / Attestation de travail / Registre de commerce',      required: true },
    { name: 'rib',             label: 'RIB bancaire',                                                        required: true },
    { name: 'questionnaire',   label: 'Formulaire questionnaire médical',                                    required: true },
    { name: 'analyse_med',     label: 'Analyses médicales (requis si capital ≥ 30 000 000 DT)',             required: false, conditional: true },
  ],
  Vol: [
    { name: 'passport',    label: 'Scan du passeport',  required: true },
    { name: 'billet_avion',label: 'Billet d\'avion',    required: false },
  ],
};

// ─── SECTION DISPLAY ──────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }) {
  if (!value && value !== 0 && value !== false) return null;
  const displayVal = value === true ? '✓ Oui' : value === false ? '✗ Non' : value;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={13} />}{label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{displayVal}</span>
    </div>
  );
}

function SectionBlock({ title, icon: Icon, color = 'primary', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `var(--${color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color={`var(--${color})`} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} color="var(--text-3)" /> : <ChevronDown size={16} color="var(--text-3)" />}
      </button>
      {open && <div style={{ padding: '4px 16px 12px' }}>{children}</div>}
    </div>
  );
}

// ─── AUTO DATA DISPLAY ────────────────────────────────────────
function AutoDataDisplay({ d }) {
  return (
    <>
      <SectionBlock title="Valeur du véhicule" icon={Car} color="primary">
        <InfoRow label="Modèle" value={d.modele} />
        <InfoRow label="Finition" value={d.finition} />
        <InfoRow label="Valeur vénale" value={d.valeurVenale ? `${Number(d.valeurVenale).toLocaleString('fr-FR')} DT` : null} />
        <InfoRow label="Valeur à neuf" value={d.valeurNeuf ? `${Number(d.valeurNeuf).toLocaleString('fr-FR')} DT` : null} />
        <InfoRow label="Référence photo" value={d.refPhoto} />
      </SectionBlock>
      <SectionBlock title="Caractéristiques" icon={Gauge} color="primary" defaultOpen={false}>
        <InfoRow label="Kilométrage" value={d.kilometrage ? `${Number(d.kilometrage).toLocaleString('fr-FR')} km` : null} />
        <InfoRow label="Boîte de vitesse" value={d.boiteVitesse} />
        <InfoRow label="Nombre de portes" value={d.nbPortes} />
      </SectionBlock>
      <SectionBlock title="Équipements" icon={Settings} color="primary" defaultOpen={false}>
        <InfoRow label="Radar de recul" value={d.radarRecul ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Système d'alarme" value={d.alarme ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Alarme de ceinture" value={d.alarmeCeinture ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="GPS" value={d.gps ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="ABS" value={d.abs ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Airbags" value={d.airbags ? '✓ Oui' : '✗ Non'} />
      </SectionBlock>
      <SectionBlock title="Stationnement & Permis" icon={Lock} color="primary" defaultOpen={false}>
        <InfoRow label="Type de stationnement" value={d.typeStationnement} />
        <InfoRow label="Clé double" value={d.cleDouble ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Autre conducteur" value={d.autreConduct ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Permis de l'assuré" value={d.permisAppartientAssure ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Type de permis" value={d.typePermis} />
        <InfoRow label="Catégorie" value={d.categoriePermis} />
        <InfoRow label="Numéro du permis" value={d.numPermis} />
        <InfoRow label="Date d'obtention" value={d.dateObtentionPermis ? new Date(d.dateObtentionPermis).toLocaleDateString('fr-FR') : null} />
      </SectionBlock>
    </>
  );
}

// ─── VIE DATA DISPLAY ─────────────────────────────────────────
function VieDataDisplay({ d }) {
  return (
    <>
      <SectionBlock title="Informations du prêt" icon={CreditCard} color="success">
        <InfoRow label="Assuré" value={`${d.prenomAssure || ''} ${d.nomAssure || ''}`.trim()} />
        <InfoRow label="Date de naissance" value={d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="GSM" value={d.gsm} />
        <InfoRow label="E-mail" value={d.email} />
        <InfoRow label="Capital emprunté" value={d.capitalEmprunte ? `${Number(d.capitalEmprunte).toLocaleString('fr-FR')} DT` : null} />
        <InfoRow label="Taux d'intérêt" value={d.tauxInteret !== undefined ? `${d.tauxInteret} %` : null} />
        <InfoRow label="Durée de remboursement" value={d.dureeRemboursement ? `${d.dureeRemboursement} mois` : null} />
        <InfoRow label="Période de franchise" value={d.periodeFranchise ? `${d.periodeFranchise} mois` : null} />
        <InfoRow label="Périodicité" value={d.periodicite} />
        <InfoRow label="Organisme prêteur" value={d.organismePreteur} />
        <InfoRow label="Date de début d'effet" value={d.dateDebutEffet ? new Date(d.dateDebutEffet).toLocaleDateString('fr-FR') : null} />
      </SectionBlock>
      <SectionBlock title="État de santé" icon={Heart} color="success" defaultOpen={false}>
        <InfoRow label="Âge" value={d.age ? `${d.age} ans` : null} />
        <InfoRow label="Taille" value={d.taille ? `${d.taille} cm` : null} />
        <InfoRow label="Poids" value={d.poids ? `${d.poids} kg` : null} />
        <InfoRow label="État de santé" value={d.etatSante} />
        <InfoRow label="Fumeur" value={d.fumeur ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Sport à risque" value={d.sportRisque ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Maladies chroniques" value={d.maladiesChroniques ? '✓ Oui' : '✗ Non'} />
        {d.maladiesChroniques && <InfoRow label="Détails maladies" value={d.detailsMaladies} />}
        <InfoRow label="Opérations chirurgicales" value={d.operationsChirurgicales ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Médicaments réguliers" value={d.medicamentsRegulier ? '✓ Oui' : '✗ Non'} />
      </SectionBlock>
      <SectionBlock title="Antécédents médicaux & familiaux" icon={Activity} color="success" defaultOpen={false}>
        <InfoRow label="Maladies graves" value={d.maladiesGraves ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Hospitalisations" value={d.hospitalise ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Suivi spécialiste" value={d.suiviSpecialiste ? '✓ Oui' : '✗ Non'} />
        <InfoRow label="Maladies héréditaires" value={d.maladiesHereditaires ? '✓ Oui' : '✗ Non'} />
        {d.maladiesHereditaires && <InfoRow label="Détails héréditaires" value={d.detailsHereditaires} />}
      </SectionBlock>
    </>
  );
}

// ─── VOL DATA DISPLAY ─────────────────────────────────────────
function VolDataDisplay({ d }) {
  return (
    <>
      <SectionBlock title="Informations du voyageur" icon={User} color="accent">
        <InfoRow label="Nom" value={`${d.prenom || ''} ${d.nom || ''}`.trim()} />
        <InfoRow label="Date de naissance" value={d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : null} />
      </SectionBlock>
      <SectionBlock title="Détails du voyage" icon={Globe} color="accent" defaultOpen={false}>
        <InfoRow label="Type de voyage" value={d.typeVoyage} />
        <InfoRow label="Voyageant" value={d.voyageAvec} />
        <InfoRow label="Type de voyageur" value={Array.isArray(d.typeVoyageur) ? d.typeVoyageur.join(', ') : d.typeVoyageur} />
        <InfoRow label="Destination" value={d.destination} />
        <InfoRow label="Date de départ" value={d.dateDepart ? new Date(d.dateDepart).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="Date de retour" value={d.dateRetour ? new Date(d.dateRetour).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="Date d'effet" value={d.dateEffet ? new Date(d.dateEffet).toLocaleDateString('fr-FR') : null} />
        <InfoRow label="Date de fin" value={d.dateFin ? new Date(d.dateFin).toLocaleDateString('fr-FR') : null} />
      </SectionBlock>
    </>
  );
}

// ─── DOC ROW ──────────────────────────────────────────────────
function DocRow({ doc, uploaded, onUpload, uploading }) {
  const inputRef = useRef();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
      background: uploaded ? 'var(--success-light)' : 'var(--surface)',
      border: `1px solid ${uploaded ? 'var(--success)' : 'var(--border)'}`,
      borderRadius: 10, transition: 'all 0.2s',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: uploaded ? 'var(--success)' : 'var(--primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {uploaded ? <CheckCircle size={17} color="white" /> : <FileText size={17} color="var(--primary)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>
          {doc.label}
          {doc.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
          {!doc.required && <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 6 }}>(optionnel)</span>}
        </p>
        {uploaded && <p style={{ fontSize: 11, color: 'var(--success)' }}>Fichier uploadé</p>}
      </div>
      <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
        {uploaded && (
          <a href={`${API_BASE}${uploaded.url}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: 'white', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
            <Eye size={12} /> Voir
          </a>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && onUpload(doc.name, doc.label, e.target.files[0], doc.required)} />
        <button onClick={() => inputRef.current.click()} disabled={uploading === doc.name}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
            background: uploaded ? 'var(--success-light)' : 'var(--primary)',
            color: uploaded ? 'var(--success)' : 'white',
            border: `1px solid ${uploaded ? 'var(--success)' : 'transparent'}`,
            fontSize: 12, fontWeight: 600,
          }}>
          {uploading === doc.name ? <span className="spinner" style={{ width: 11, height: 11 }} /> : <Upload size={12} />}
          {uploaded ? 'Remplacer' : 'Uploader'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sigLoading, setSigLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const fetchContract = async () => {
    try {
      const { data } = await api.get(`/contracts/${id}`);
      setContract(data);
    } catch {
      toast.error('Contrat introuvable');
      router.push('/contrats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContract(); }, [id]);

  // Detect Stripe redirect — verify session server-side and activate contract
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      // Call backend to verify Stripe session and activate contract
      const verify = async () => {
        try {
          const sessionId = searchParams.get('session_id');
          await api.post('/payments/verify-and-activate', { contractId: id, sessionId });
        } catch (err) {
          console.error('verify error', err);
        }
        toast.success('🎉 Paiement réussi ! Votre contrat est maintenant actif.');
        router.replace('/contrats/' + id);
        fetchContract();
      };
      verify();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Paiement annulé.');
      router.replace('/contrats/' + id);
    }
  }, [searchParams]);

  // Build docs list for this type
  const getDocsList = (c) => {
    if (!c) return [];
    const base = REQUIRED_DOCS[c.type] || [];
    const needAnalyseMed = c.type === 'Vie' && (c.vieData?.capitalEmprunte || 0) >= 30000000;
    return base.filter(d => !d.conditional || (d.name === 'analyse_med' && needAnalyseMed));
  };

  const handleUpload = async (docName, docLabel, file, required) => {
    setUploading(docName);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('docName', docName);
      form.append('docLabel', docLabel);
      form.append('required', String(required));
      const { data } = await api.post(`/contracts/${id}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContract(data);
      toast.success('Document uploadé !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmitDossier = async () => {
    const docs = getDocsList(contract);
    const uploadedMap = {};
    (contract.documents || []).forEach(d => { uploadedMap[d.name] = d; });

    const missing = docs.filter(d => d.required && !uploadedMap[d.name]);
    if (missing.length > 0) {
      const names = missing.map(d => d.label).join(', ');
      toast.error(`Veuillez uploader : ${names}`, { duration: 5000 });
      return;
    }
    setSubmitLoading(true);
    try {
      const { data } = await api.post(`/contracts/${id}/submit-dossier`);
      setContract(data);
      toast.success('Dossier soumis à l\'administrateur !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePay = async (method) => {
    if (method === 'online') {
      setStripeLoading(true);
      try {
        const { data } = await api.post('/payments/create-checkout-session', { contractId: id });
        window.location.href = data.url;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erreur Stripe');
        setStripeLoading(false);
      }
      return;
    }
    // Cash
    setPayLoading(true);
    try {
      const { data } = await api.post(`/contracts/${id}/pay`, { method });
      setContract(data);
      setShowPayModal(false);
      toast.success('Paiement cash enregistré. Présentez-vous à l\'agence.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur paiement');
    } finally {
      setPayLoading(false);
    }
  };

  const handleSwitchToOnline = async () => {
    if (!confirm('Passer au paiement en ligne ? Vous allez être redirigé vers Stripe pour payer.')) return;
    setSwitchLoading(true);
    try {
      // Step 1: Reset contract payment status to unpaid on backend
      await api.post(`/contracts/${id}/switch-online`);
      // Step 2: Launch Stripe checkout (same as regular online payment)
      const { data } = await api.post('/payments/create-checkout-session', { contractId: id });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
      setSwitchLoading(false);
    }
    // Note: don't reset loading here — page will redirect to Stripe
  };

  // ── SIGNATURE CANVAS HELPERS ──────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e) => {
    e.preventDefault();
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return !data.some(v => v !== 0);
  };

  const handleSaveSignature = async () => {
    if (isCanvasEmpty()) { toast.error('Veuillez dessiner votre signature'); return; }
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSigLoading(true);
    try {
      await api.post(`/contracts/${id}/sign`, { signature: dataUrl });
      setContract(prev => ({ ...prev, clientSignature: dataUrl, signedAt: new Date().toISOString() }));
      toast.success('Signature enregistrée !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur signature');
    } finally {
      setSigLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateContractPDF(contract);
    } catch (err) {
      toast.error('Erreur génération PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );
  if (!contract) return null;

  const typeLabel = contract.type === 'Auto' ? 'Automobile' : contract.type === 'Vie' ? 'Vie' : 'Voyage';
  const TypeIcon = contract.type === 'Auto' ? Car : contract.type === 'Vie' ? HeartPulse : Plane;
  const typeGradient = contract.type === 'Auto'
    ? 'linear-gradient(135deg,#0052CC,#2684FF)'
    : contract.type === 'Vie'
    ? 'linear-gradient(135deg,#00875A,#36B37E)'
    : 'linear-gradient(135deg,#6554C0,#8777D9)';

  const docs = getDocsList(contract);
  const uploadedMap = {};
  (contract.documents || []).forEach(d => { uploadedMap[d.name] = d; });
  const requiredDocs = docs.filter(d => d.required);
  const uploadedRequired = requiredDocs.filter(d => uploadedMap[d.name]);
  const allRequiredUploaded = uploadedRequired.length === requiredDocs.length;
  const needAnalyseMed = contract.type === 'Vie' && (contract.vieData?.capitalEmprunte || 0) >= 30000000;

  const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  // Timeline: pending → approved → active
  const STEPS = [
    { key: 'pending',  label: 'En attente' },
    { key: 'approved', label: 'Approuvé' },
    { key: 'active',   label: 'Actif' },
  ];
  const stepIdx = contract.status === 'rejected' ? -1 : STEPS.findIndex(s => s.key === contract.status);

  return (
    <div>
      <Link href="/contrats" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={14} /> Retour à mes contrats
      </Link>

      {/* Hero card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: typeGradient, padding: '1.5rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TypeIcon size={30} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Assurance {typeLabel}</p>
                <p style={{ fontSize: 13, opacity: 0.85, fontFamily: 'monospace' }}>{contract.numeroContrat}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })}</p>
              <p style={{ fontSize: 14, opacity: 0.85 }}>DT / an</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.875rem', borderRadius: 99, background: statusCfg.bg, color: statusCfg.color, fontSize: 13, fontWeight: 600 }}>
            <StatusIcon size={13} /> {statusCfg.label}
            {contract.dossierSubmitted && contract.status === 'pending' && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>· Dossier soumis</span>
            )}
          </span>
          {contract.paymentStatus === 'pending_cash' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.875rem', borderRadius: 99, background: 'rgba(255,139,0,0.12)', color: '#FF8B00', fontSize: 13, fontWeight: 600 }}>
              <Building2 size={13} /> Paiement cash en attente
            </span>
          )}
        </div>

        {contract.adminNote && (
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 10 }}>
              <Info size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: 'var(--primary)' }}><strong>Note :</strong> {contract.adminNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {contract.status !== 'rejected' && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Suivi du dossier</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((step, i) => {
              const done = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 17,
                      border: `2px solid ${done ? 'var(--success)' : 'var(--border)'}`,
                      background: done ? 'var(--success)' : 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: active ? '0 0 0 4px var(--success-light)' : 'none',
                    }}>
                      {done ? <CheckCircle size={17} color="white" /> : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: done ? 700 : 400, color: done ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--success)' : 'var(--border)', margin: '0 8px', marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {contract.status === 'rejected' && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: 24, border: '1px solid var(--danger)', background: 'var(--danger-light)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <XCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Contrat rejeté</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{contract.adminNote || 'Veuillez contacter notre service client.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment: approved + unpaid */}
      {contract.status === 'approved' && contract.paymentStatus === 'unpaid' && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: 24, border: '2px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="var(--success)" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>✅ Contrat approuvé — Procédez au paiement</h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Choisissez votre mode de paiement pour activer le contrat</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--success-light)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>Montant à payer</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--success)' }}>{(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT</span>
          </div>
          <button className="btn-primary" onClick={() => setShowPayModal(true)} style={{ width: '100%', gap: 8, background: 'var(--success)' }}>
            <CreditCard size={16} /> Payer maintenant
          </button>
        </div>
      )}

      {/* Cash pending: option to switch to online */}
      {contract.paymentStatus === 'pending_cash' && contract.status !== 'active' && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: 24, border: '1px solid #FF8B00' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Building2 size={20} color="#FF8B00" />
            <div>
              <p style={{ fontWeight: 700, color: '#FF8B00' }}>Paiement cash en attente de validation</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Présentez-vous à l'agence avec le montant de {(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT</p>
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 10, marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Vous avez changé d'avis ? Vous pouvez passer au paiement en ligne et activer votre contrat immédiatement.
            </p>
          </div>
          <button onClick={handleSwitchToOnline} disabled={switchLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            {switchLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Wifi size={16} />}
            Passer au paiement en ligne
          </button>
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

        {/* Left: Documents */}
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Documents requis</h2>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{uploadedRequired.length}/{requiredDocs.length} obligatoires uploadés</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width 0.4s',
                background: allRequiredUploaded ? 'var(--success)' : 'var(--primary)',
                width: `${requiredDocs.length > 0 ? (uploadedRequired.length / requiredDocs.length) * 100 : 0}%`
              }} />
            </div>

            {needAnalyseMed && (
              <div style={{ padding: 12, background: 'rgba(255,139,0,0.1)', border: '1px solid #FF8B00', borderRadius: 10, marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#FF8B00', fontWeight: 600 }}>⚠️ Capital ≥ 30 000 000 DT : Analyses médicales obligatoires</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {docs.map(doc => (
                <DocRow
                  key={doc.name}
                  doc={doc}
                  uploaded={uploadedMap[doc.name]}
                  onUpload={handleUpload}
                  uploading={uploading}
                />
              ))}
            </div>

            {/* Submit dossier button */}
            {!contract.dossierSubmitted && contract.status === 'pending' && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {!allRequiredUploaded && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12 }}>
                    <Info size={14} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Uploadez tous les documents obligatoires (*) puis soumettez votre dossier à l'administrateur.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSubmitDossier}
                  disabled={submitLoading}
                  className="btn-primary"
                  style={{ width: '100%', gap: 8, opacity: allRequiredUploaded ? 1 : 0.7 }}
                >
                  {submitLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={16} />}
                  Soumettre le dossier à l'administrateur
                </button>
              </div>
            )}

            {contract.dossierSubmitted && contract.status === 'pending' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>Dossier soumis — en cours d'examen par l'administrateur</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Souscription data + contract info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Contract info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Récapitulatif du contrat</h2>
            <InfoRow label="Type" value={`Assurance ${typeLabel}`} />
            <InfoRow label="N° Contrat" value={contract.numeroContrat} />
            <InfoRow label="Date de création" value={new Date(contract.createdAt).toLocaleDateString('fr-FR')} />
            <InfoRow label="Début" value={contract.startDate ? new Date(contract.startDate).toLocaleDateString('fr-FR') : null} />
            <InfoRow label="Fin" value={contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : null} />
            <InfoRow label="Prime annuelle" value={`${(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT`} />
            {contract.paidAt && <InfoRow label="Payé le" value={new Date(contract.paidAt).toLocaleDateString('fr-FR')} />}
          </div>

          {/* Souscription details */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Informations de souscription
            </p>
            {contract.type === 'Auto' && contract.autoData && <AutoDataDisplay d={contract.autoData} />}
            {contract.type === 'Vie' && contract.vieData && <VieDataDisplay d={contract.vieData} />}
            {contract.type === 'Vol' && contract.volData && <VolDataDisplay d={contract.volData} />}
          </div>
        </div>
      </div>

      {/* Signature block — shown when contract is active */}
      {(contract.status === 'active' || contract.status === 'approved') && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenLine size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Signature électronique</h2>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {contract.clientSignature
                    ? 'Contrat signé le ' + new Date(contract.signedAt).toLocaleDateString('fr-FR')
                    : 'Signez le contrat pour pouvoir le télécharger'}
                </p>
              </div>
            </div>
            {contract.clientSignature && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
              >
                {downloading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Download size={15} />}
                Télécharger le contrat PDF
              </button>
            )}
          </div>

          {!contract.clientSignature ? (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 10, marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--primary)' }}>
                  Dessinez votre signature dans le cadre ci-dessous avec votre souris ou votre doigt.
                </p>
              </div>
              <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 12, background: '#fafafa', overflow: 'hidden', touchAction: 'none' }}>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  style={{ display: 'block', width: '100%', height: 140, cursor: 'crosshair', touchAction: 'none' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
                  Signez ici
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={clearCanvas} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <Trash2 size={14} /> Effacer
                </button>
                <button onClick={handleSaveSignature} disabled={sigLoading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, flex: 1, justifyContent: 'center' }}>
                  {sigLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <PenLine size={14} />}
                  Enregistrer ma signature
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Votre signature</p>
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, background: '#fafafa', padding: 8, display: 'inline-block' }}>
                  <img src={contract.clientSignature} alt="Signature client" style={{ maxHeight: 80, maxWidth: 280 }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={13} /> Signature enregistrée
                </p>
                <button
                  onClick={() => setContract(prev => ({ ...prev, clientSignature: null, signedAt: null }))}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Trash2 size={13} /> Re-signer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Mode de paiement</h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
              Montant : <strong>{(contract.price || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => handlePay('online')} disabled={stripeLoading || payLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(99,91,255,0.08)', border: '2px solid #635BFF', borderRadius: 14, cursor: stripeLoading ? 'wait' : 'pointer', textAlign: 'left', width: '100%', opacity: stripeLoading ? 0.8 : 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {stripeLoading
                    ? <span className="spinner" style={{ width: 20, height: 20, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    : <CreditCard size={22} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#635BFF', margin: 0 }}>{stripeLoading ? 'Redirection...' : 'Paiement en ligne'}</p>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#635BFF', background: 'rgba(99,91,255,0.15)', borderRadius: 4, padding: '1px 6px' }}>stripe</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>Paiement sécurisé par carte • Activation immédiate</p>
                </div>
              </button>
              <button onClick={() => handlePay('cash')} disabled={payLoading || stripeLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(255,139,0,0.08)', border: '2px solid #FF8B00', borderRadius: 14, cursor: payLoading ? 'wait' : 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {payLoading
                    ? <span className="spinner" style={{ width: 20, height: 20, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    : <Banknote size={22} color="white" />}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#FF8B00', marginBottom: 2 }}>Cash en agence</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Validation par l'administrateur après réception</p>
                </div>
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginTop: 20,
                padding: '12px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: 'var(--text-3)',
                }}
              >
                <Lock size={12} color="#635BFF" /> Paiement sécurisé
              </div>
            </div>
            <button onClick={() => setShowPayModal(false)} className="btn-outline" style={{ width: '100%', marginTop: 12 }} disabled={stripeLoading || payLoading}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
