'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard, TrendingUp, Clock, CheckCircle, Building2, Search,
  Car, HeartPulse, Plane, Shield, Banknote, Wifi, Eye, XCircle, Download
} from 'lucide-react';
import api from '../../../lib/api';
import { generatePaymentPDF } from '../../../lib/generatePaymentPDF';

const TYPE_CONFIG = {
  Auto: { icon: Car,        color: 'primary',  label: 'Automobile' },
  Vie:  { icon: HeartPulse, color: 'success',  label: 'Vie' },
  Vol:  { icon: Plane,      color: 'accent',   label: 'Voyage' },
};

export default function AdminPaiements() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (contract) => {
    setDownloading(contract._id);
    try { await generatePaymentPDF(contract); }
    catch (e) { console.error(e); }
    finally { setDownloading(null); }
  };

  const fetchContracts = async () => {
    try {
      const { data } = await api.get('/contracts');
      // Only active contracts
      setContracts(data.filter(c => c.status === 'active'));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchContracts(); }, []);

  const validateCash = async (id) => {
    try {
      await api.post(`/contracts/${id}/validate-cash`);
      toast.success('Paiement cash validé — contrat activé !');
      fetchContracts();
    } catch { toast.error('Erreur'); }
  };

  const stats = {
    totalRevenue: contracts.filter(c => c.paymentStatus === 'paid').reduce((s, c) => s + (c.price || 0), 0),
    paid: contracts.filter(c => c.paymentStatus === 'paid').length,
    cashPending: contracts.filter(c => c.paymentStatus === 'pending_cash').length,
    online: contracts.filter(c => c.paymentStatus === 'paid' && c.paymentMethod === 'online').length,
    cashPaid: contracts.filter(c => c.paymentStatus === 'paid' && c.paymentMethod === 'cash').length,
  };

  const filtered = contracts.filter(c => {
    if (filter === 'paid' && c.paymentStatus !== 'paid') return false;
    if (filter === 'pending_cash' && c.paymentStatus !== 'pending_cash') return false;
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
            <CreditCard size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Finances</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Gestion des Paiements</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Suivez et validez les paiements des clients</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Revenu total',         value: `${stats.totalRevenue.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT`, icon: TrendingUp,  color: 'success' },
          { label: 'Paiements reçus',      value: stats.paid,         icon: CheckCircle, color: 'success' },
          { label: 'Paiements en ligne',   value: stats.online,       icon: Wifi,        color: 'primary' },
          { label: 'Paiements en espèces', value: stats.cashPaid,     icon: Banknote,    color: 'accent'  },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ padding: '0.875rem', animationDelay: `${i * 0.05}s` }}>
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

      {/* Cash pending alert */}
      {stats.cashPending > 0 && (
        <div style={{ padding: '16px 20px', background: 'rgba(255,139,0,0.08)', border: '1px solid #FF8B00', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={20} color="#FF8B00" />
            <div>
              <p style={{ fontWeight: 700, color: '#FF8B00', marginBottom: 2 }}>
                {stats.cashPending} paiement(s) cash en attente de validation
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Ces clients ont choisi de payer en espèces à l'agence. Validez ci-dessous après réception.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'tous',         label: `Tous (${contracts.length})` },
            { key: 'pending_cash', label: `⏳ Cash en attente (${stats.cashPending})` },
            { key: 'paid',         label: `✓ Payés (${stats.paid})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.4rem 1rem', borderRadius: 99, fontSize: 12, cursor: 'pointer',
              fontWeight: filter === f.key ? 700 : 400,
              background: filter === f.key ? 'var(--primary-light)' : 'var(--surface)',
              color: filter === f.key ? 'var(--primary)' : 'var(--text-2)',
              border: `1px solid ${filter === f.key ? 'var(--primary)' : 'var(--border)'}`,
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem 1rem' }}>
          <Search size={14} color="var(--text-3)" />
          <input type="text" placeholder="Client, N° contrat..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 200 }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['N° Contrat','Type','Client','Prime annuelle','Méthode','Statut paiement','Contrat','Date paiement','Quittance'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>Aucun contrat actif trouvé</td></tr>
                ) : filtered.map(c => {
                  const typeCfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.Auto;
                  const Icon = typeCfg.icon;
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary)' }}>{c.numeroContrat?.slice(0, 16) || '—'}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color={`var(--${typeCfg.color})`} />
                          <span style={{ fontSize: 12 }}>{typeCfg.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{c.user?.username || '—'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.user?.email}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{(c.price || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.paymentMethod === 'online' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}><Wifi size={13} color="var(--primary)" /> En ligne</span>
                        ) : c.paymentMethod === 'cash' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}><Banknote size={13} color="#FF8B00" /> Cash agence</span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.paymentStatus === 'paid' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.75rem', borderRadius: 99, background: 'var(--success-light)', color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                            <CheckCircle size={12} /> Payé
                          </span>
                        ) : c.paymentStatus === 'pending_cash' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.75rem', borderRadius: 99, background: 'rgba(255,139,0,0.12)', color: '#FF8B00', fontSize: 12, fontWeight: 600 }}>
                            <Clock size={12} /> Cash att.
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Non payé</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.75rem', borderRadius: 99, background: c.status === 'active' ? 'var(--success-light)' : 'var(--surface)', color: c.status === 'active' ? 'var(--success)' : 'var(--text-3)', fontSize: 11, fontWeight: 600 }}>
                          {c.status === 'active' ? <><Shield size={11} /> Actif</> : c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.paidAt ? (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{new Date(c.paidAt).toLocaleDateString('fr-FR')}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(c.paidAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.paymentStatus === 'paid' ? (
                          <button
                            onClick={() => handleDownload(c)}
                            disabled={downloading === c._id}
                            title="Telecharger la quittance PDF"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                              background: 'var(--surface)', color: 'var(--text-1)',
                              border: '1px solid var(--border)', fontSize: 12, fontWeight: 600,
                              opacity: downloading === c._id ? 0.6 : 1,
                            }}
                          >
                            {downloading === c._id
                              ? <span className="spinner" style={{ width: 12, height: 12 }} />
                              : <Download size={13} />}
                            PDF
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}