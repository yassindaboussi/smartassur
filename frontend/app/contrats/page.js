'use client';
import { useState, useEffect } from 'react';
import {
  FileText, Shield, Car, HeartPulse, Plane, Search, Clock,
  CheckCircle, XCircle, Wallet, Calendar, Plus, Eye,
  CreditCard, Upload, AlertCircle, Send, Download
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { generateContractPDF } from '../../lib/generateContractPDF';

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: '#FF8B00',        bg: 'rgba(255,139,0,0.12)' },
  approved: { label: 'Approuvé',   color: 'var(--success)', bg: 'var(--success-light)' },
  active:   { label: 'Actif',      color: 'var(--success)', bg: 'var(--success-light)' },
  rejected: { label: 'Rejeté',     color: 'var(--danger)',  bg: 'var(--danger-light)' },
};

const TYPE_CONFIG = {
  Auto: { icon: Car,        gradient: 'linear-gradient(135deg,#0052CC,#2684FF)' },
  Vie:  { icon: HeartPulse, gradient: 'linear-gradient(135deg,#00875A,#36B37E)' },
  Vol:  { icon: Plane,      gradient: 'linear-gradient(135deg,#6554C0,#8777D9)' },
};

const REQUIRED_DOCS_COUNT = { Auto: 5, Vie: 5, Vol: 1 }; // required only count

function getRequiredDocsCount(contract) {
  const base = {
    Auto: ['cin', 'permis', 'carte_grise', 'vignette', 'visite_tech'],
    Vie: ['cin', 'justif_domicile', 'fiche_paie', 'rib', 'questionnaire'],
    Vol: ['passport'],
  };
  const needed = base[contract.type] || [];
  // Add analyse_med if capital >= 30M for Vie
  if (contract.type === 'Vie' && (contract.vieData?.capitalEmprunte || 0) >= 30000000) {
    needed.push('analyse_med');
  }
  return needed;
}

export default function ContratsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (contract) => {
    setDownloading(contract._id);
    try {
      await generateContractPDF(contract);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    api.get('/contracts')
      .then(({ data }) => setContracts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = contracts.filter(c => {
    if (filter !== 'tous' && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.type?.toLowerCase().includes(s) || c.numeroContrat?.toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    active:   contracts.filter(c => c.status === 'active').length,
    pending:  contracts.filter(c => c.status === 'pending').length,
    approved: contracts.filter(c => c.status === 'approved').length,
    rejected: contracts.filter(c => c.status === 'rejected').length,
  };

  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mes assurances</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Mes Contrats</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Gérez l'ensemble de vos contrats d'assurance</p>
          </div>
          <Link href="/souscription" className="btn-primary" style={{ gap: 8 }}>
            <Plus size={16} /> Nouvelle souscription
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Actifs',    value: stats.active,    icon: Shield,    color: 'success' },
          { label: 'En attente',value: stats.pending,   icon: Clock,     color: 'warning' },
          { label: 'À payer',   value: stats.approved,  icon: CreditCard,color: 'primary' },
          { label: 'Rejetés',   value: stats.rejected,  icon: XCircle,   color: 'danger'  },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem', animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${s.color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={`var(--${s.color})`} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['tous', 'pending', 'approved', 'active', 'rejected'].map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = s === 'tous' ? contracts.length : contracts.filter(c => c.status === s).length;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 1rem', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                fontWeight: filter === s ? 700 : 400,
                background: filter === s ? (cfg?.bg || 'var(--primary-light)') : 'var(--surface)',
                color: filter === s ? (cfg?.color || 'var(--primary)') : 'var(--text-2)',
                border: `1px solid ${filter === s ? (cfg?.color || 'var(--primary)') : 'var(--border)'}`,
              }}>
                {s === 'tous' ? 'Tous' : cfg?.label} ({count})
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
          <Search size={15} color="var(--text-3)" />
          <input type="text" placeholder="N° contrat, type..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 180 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : contracts.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun contrat</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Commencez dès maintenant à protéger ce qui compte pour vous</p>
          <Link href="/souscription" className="btn-primary" style={{ gap: 8 }}>
            <Plus size={16} /> Souscrire un contrat
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Search size={48} color="var(--text-3)" style={{ marginBottom: 16 }} />
          <h3>Aucun contrat trouvé</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((contract, i) => {
            const cfg = TYPE_CONFIG[contract.type] || TYPE_CONFIG.Auto;
            const Icon = cfg.icon;
            const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
            const canPay = contract.status === 'approved' && contract.paymentStatus === 'unpaid';
            const isPendingCash = contract.paymentStatus === 'pending_cash';

            // Docs progress
            const requiredDocNames = getRequiredDocsCount(contract);
            const uploadedCount = (contract.documents || []).filter(d =>
              requiredDocNames.includes(d.name)
            ).length;
            const totalRequired = requiredDocNames.length;
            const allUploaded = uploadedCount >= totalRequired;
            const showUploadAlert = contract.status === 'pending' && !contract.dossierSubmitted && !allUploaded;
            const showSubmitAlert = contract.status === 'pending' && !contract.dossierSubmitted && allUploaded;

            return (
              <div key={contract._id} className="card hover-lift" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.04}s` }}>
                {/* Gradient header */}
                <div style={{ background: cfg.gradient, padding: '1.25rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700 }}>Assurance {contract.type === 'Vol' ? 'Voyage' : contract.type}</p>
                        <p style={{ fontSize: 11, opacity: 0.8, fontFamily: 'monospace' }}>{contract.numeroContrat?.slice(0, 16) || '—'}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 22, fontWeight: 800 }}>{(contract.price || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })}</p>
                      <p style={{ fontSize: 11, opacity: 0.8 }}>DT/an</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.25rem' }}>
                  {/* Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '0.25rem 0.75rem', borderRadius: 99,
                      background: statusCfg.bg, color: statusCfg.color,
                      fontSize: 12, fontWeight: 600
                    }}>
                      {statusCfg.label}
                      {contract.dossierSubmitted && contract.status === 'pending' && (
                        <span style={{ marginLeft: 4, fontSize: 10 }}>· Soumis</span>
                      )}
                    </span>
                    {isPendingCash && (
                      <span style={{ fontSize: 11, color: '#FF8B00', fontWeight: 600 }}>⏳ Cash att.</span>
                    )}
                  </div>

                  {/* Upload progress — only show if pending & not yet submitted to admin */}
                  {contract.status === 'pending' && !contract.dossierSubmitted && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: allUploaded ? 'var(--success)' : 'var(--text-3)', fontWeight: 600 }}>
                          {allUploaded ? '✓ Documents complets' : `Documents : ${uploadedCount}/${totalRequired} uploadés`}
                        </span>
                        {!allUploaded && (
                          <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Dossier incomplet</span>
                        )}
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: allUploaded ? 'var(--success)' : 'var(--primary)',
                          width: `${totalRequired > 0 ? (uploadedCount / totalRequired) * 100 : 0}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Alert: need to upload docs */}
                  {showUploadAlert && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--danger-light)', borderRadius: 8, marginBottom: 10 }}>
                      <AlertCircle size={13} color="var(--danger)" />
                      <p style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>
                        Uploadez tous les fichiers avant de soumettre à l'admin
                      </p>
                    </div>
                  )}

                  {/* Alert: ready to submit */}
                  {showSubmitAlert && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--success-light)', borderRadius: 8, marginBottom: 10 }}>
                      <Send size={13} color="var(--success)" />
                      <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                        Dossier complet — soumettez-le à l'administrateur
                      </p>
                    </div>
                  )}

                  {contract.startDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
                      <Calendar size={12} />
                      {new Date(contract.startDate).toLocaleDateString('fr-FR')} — {contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/contrats/${contract._id}`} className="btn-outline" style={{ flex: 1, gap: 6, justifyContent: 'center', fontSize: 13 }}>
                      {(showUploadAlert || showSubmitAlert) ? <><Upload size={13} /> Gérer</> : <><Eye size={13} /> Consulter</>}
                    </Link>
                    {canPay && (
                      <Link href={`/contrats/${contract._id}`} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '0.5rem', borderRadius: 10, textDecoration: 'none',
                        background: 'var(--success)', color: 'white', fontSize: 13, fontWeight: 700,
                      }}>
                        <CreditCard size={13} /> Payer
                      </Link>
                    )}
                    {contract.status === 'active' && (
                      <button
                        onClick={() => handleDownload(contract)}
                        disabled={downloading === contract._id}
                        title="Télécharger le contrat PDF"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '0.5rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          border: '1px solid var(--primary)', fontSize: 12, fontWeight: 600,
                          opacity: downloading === contract._id ? 0.6 : 1,
                        }}
                      >
                        {downloading === contract._id
                          ? <span className="spinner" style={{ width: 13, height: 13 }} />
                          : <Download size={13} />}
                        PDF
                      </button>
                    )}
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