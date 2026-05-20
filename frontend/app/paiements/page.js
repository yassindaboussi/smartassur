'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, TrendingUp, Clock, CheckCircle, Wallet, Calendar,
  Search, Eye, Car, HeartPulse, Plane, Shield, Wifi, Banknote,
  Building2, AlertCircle, Plus, Download
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { generatePaymentPDF } from '../../lib/generatePaymentPDF';

const TYPE_CONFIG = {
  Auto: { icon: Car,        gradient: 'linear-gradient(135deg,#0052CC,#2684FF)', label: 'Automobile' },
  Vie:  { icon: HeartPulse, gradient: 'linear-gradient(135deg,#00875A,#36B37E)', label: 'Vie' },
  Vol:  { icon: Plane,      gradient: 'linear-gradient(135deg,#6554C0,#8777D9)', label: 'Voyage' },
};

export default function PaiementsPage() {
  const router = useRouter();
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

  useEffect(() => {
    api.get('/contracts')
      .then(({ data }) => setContracts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only contracts with payment relevance
  const paymentContracts = contracts.filter(c =>
    c.status === 'approved' || c.status === 'active' ||
    c.paymentStatus === 'pending_cash' || c.paymentStatus === 'paid'
  );

  const filtered = paymentContracts.filter(c => {
    if (filter === 'approved' && !(c.status === 'approved' && c.paymentStatus === 'unpaid')) return false;
    if (filter === 'pending_cash' && c.paymentStatus !== 'pending_cash') return false;
    if (filter === 'paid' && c.paymentStatus !== 'paid') return false;
    if (search) {
      const s = search.toLowerCase();
      return c.numeroContrat?.toLowerCase().includes(s) || c.type?.toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    totalPaid: contracts.filter(c => c.paymentStatus === 'paid').reduce((s, c) => s + (c.price || 0), 0),
    paid:         contracts.filter(c => c.paymentStatus === 'paid').length,
    pendingCash:  contracts.filter(c => c.paymentStatus === 'pending_cash').length,
    toPay:        contracts.filter(c => c.status === 'approved' && c.paymentStatus === 'unpaid').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Finances</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Mes Paiements</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Suivez vos paiements et réglez vos contrats approuvés</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total payé',     value: `${stats.totalPaid.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT`, icon: TrendingUp,  color: 'success' },
          { label: 'Contrats payés', value: stats.paid,    icon: CheckCircle, color: 'success' },
          { label: 'À payer',        value: stats.toPay,   icon: CreditCard,  color: 'primary' },
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

      {/* Alert: contracts to pay */}
      {stats.toPay > 0 && (
        <div style={{ padding: '16px 20px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} color="var(--success)" />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 2 }}>
                {stats.toPay} contrat{stats.toPay > 1 ? 's' : ''} approuvé{stats.toPay > 1 ? 's' : ''} en attente de paiement
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Procédez au paiement pour activer votre protection.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'tous',         label: `Tous (${paymentContracts.length})` },
            { key: 'approved',     label: `À payer (${stats.toPay})` },
            { key: 'pending_cash', label: `Cash att. (${stats.pendingCash})` },
            { key: 'paid',         label: `Payés (${stats.paid})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.4rem 1rem', borderRadius: 99, fontSize: 13, cursor: 'pointer',
              fontWeight: filter === f.key ? 700 : 400,
              background: filter === f.key ? 'var(--primary-light)' : 'var(--surface)',
              color: filter === f.key ? 'var(--primary)' : 'var(--text-2)',
              border: `1px solid ${filter === f.key ? 'var(--primary)' : 'var(--border)'}`,
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
          <Search size={15} color="var(--text-3)" />
          <input type="text" placeholder="N° contrat, type..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: 180 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : paymentContracts.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CreditCard size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucun paiement</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Vos paiements apparaîtront ici lorsqu'un contrat sera approuvé</p>
          <Link href="/souscription" className="btn-primary" style={{ gap: 8 }}>
            <Plus size={16} /> Souscrire un contrat
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Search size={48} color="var(--text-3)" style={{ marginBottom: 16 }} />
          <h3>Aucun résultat</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((c, i) => {
            const typeCfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.Auto;
            const Icon = typeCfg.icon;
            const canPay = c.status === 'approved' && c.paymentStatus === 'unpaid';
            const isPendingCash = c.paymentStatus === 'pending_cash';
            const isPaid = c.paymentStatus === 'paid';

            return (
              <div key={c._id} className="card hover-lift" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.04}s` }}>
                <div style={{ background: typeCfg.gradient, padding: '1.25rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700 }}>Assurance {typeCfg.label}</p>
                        <p style={{ fontSize: 11, opacity: 0.8, fontFamily: 'monospace' }}>{c.numeroContrat?.slice(0, 16)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 26, fontWeight: 900 }}>{(c.price || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })}</p>
                      <p style={{ fontSize: 11, opacity: 0.8 }}>DT/an</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.25rem' }}>
                  {/* Payment status */}
                  <div style={{ marginBottom: 12 }}>
                    {isPaid && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--success-light)', borderRadius: 9 }}>
                        <CheckCircle size={15} color="var(--success)" />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>Payé</p>
                          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                            {c.paymentMethod === 'online' ? 'En ligne' : 'Cash agence'}
                            {c.paidAt && ` · ${new Date(c.paidAt).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {isPendingCash && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,139,0,0.1)', borderRadius: 9, border: '1px solid #FF8B00' }}>
                        <Building2 size={15} color="#FF8B00" />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#FF8B00' }}>Cash en attente de validation</p>
                          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>Présentez-vous à l'agence</p>
                        </div>
                      </div>
                    )}
                    {canPay && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--success-light)', borderRadius: 9, border: '1px solid var(--success)' }}>
                        <CreditCard size={15} color="var(--success)" />
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>Contrat approuvé — Paiement requis</p>
                      </div>
                    )}
                  </div>

                  {/* Validity dates */}
                  {(c.startDate || c.endDate) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
                      <Calendar size={12} />
                      {c.startDate ? new Date(c.startDate).toLocaleDateString('fr-FR') : '—'} — {c.endDate ? new Date(c.endDate).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/contrats/${c._id}`} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '0.6rem', borderRadius: 10, textDecoration: 'none',
                      background: canPay ? 'var(--success)' : isPendingCash ? 'rgba(255,139,0,0.15)' : 'var(--primary-light)',
                      color: canPay ? 'white' : isPendingCash ? '#FF8B00' : 'var(--primary)',
                      fontSize: 13, fontWeight: 700,
                      border: isPendingCash ? '1px solid #FF8B00' : 'none',
                    }}>
                      {canPay ? <><CreditCard size={14} /> Payer maintenant</> :
                       isPendingCash ? <><Wifi size={14} /> Passer au paiement en ligne</> :
                       <><Eye size={14} /> Voir le contrat</>}
                    </Link>
                    {isPaid && (
                      <button
                        onClick={() => handleDownload(c)}
                        disabled={downloading === c._id}
                        title="Telecharger la quittance PDF"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '0.6rem 0.9rem', borderRadius: 10, cursor: 'pointer',
                          background: 'var(--surface)', color: 'var(--text-1)',
                          border: '1px solid var(--border)', fontSize: 13, fontWeight: 600,
                          opacity: downloading === c._id ? 0.6 : 1,
                        }}
                      >
                        {downloading === c._id
                          ? <span className="spinner" style={{ width: 13, height: 13 }} />
                          : <Download size={14} />}
                        Quittance
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