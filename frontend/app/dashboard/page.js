'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  FileText, AlertTriangle, CreditCard, MessageSquare, Plus, ArrowRight, 
  Calculator, TrendingUp, Sparkles, Shield, Clock, CheckCircle, 
  Star, Wallet, Users, Calendar, Bell, ChevronRight,
  Home, Award, Zap, HeartHandshake
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    contracts: 0, 
    claims: 0, 
    payments: 0, 
    reclamations: 0, 
    total: 0,
    activeContracts: 0,
    pendingClaims: 0
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractsRes, claimsRes, reclamationsRes] = await Promise.all([
          api.get('/contracts'),
          api.get('/claims'),
          api.get('/reclamations')
        ]);
        
        const contracts = contractsRes.data;
        const claims = claimsRes.data;
        
        const total = contracts.filter(c => c.paymentStatus === 'paid').reduce((s, c) => s + (c.price || 0), 0);
        const activeContracts = contracts.filter(c => c.status === 'active').length;
        const pendingClaims = claims.filter(c => c.status === 'en attente').length;
        const toPay = contracts.filter(c => c.status === 'approved' && c.paymentStatus === 'unpaid').length;
        
        setStats({ 
          contracts: contracts.length, 
          claims: claims.length, 
          toPay,
          reclamations: reclamationsRes.data.length, 
          total,
          activeContracts,
          pendingClaims
        });
        
        setRecentContracts(contracts.slice(0, 2));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Contrats actifs', value: stats.activeContracts, total: stats.contracts, href: '/contrats', icon: FileText, color: 'primary', bg: 'var(--primary-light)' },
    { label: 'Sinistres', value: stats.claims, pending: stats.pendingClaims, href: '/sinistres', icon: AlertTriangle, color: 'warning', bg: 'var(--warning-light)' },
    { label: 'Réclamations', value: stats.reclamations, href: '/reclamations', icon: MessageSquare, color: 'info', bg: 'var(--info-light)' },
    { label: 'Total versé', value: `${stats.total.toFixed(0)} DT`, href: '/paiements', icon: Wallet, color: 'accent', bg: 'var(--accent-light)' },
  ];

  const quickActions = [
    { href: '/souscription', label: 'Nouvelle souscription', sub: 'Choisir une assurance', icon: Calculator, color: 'primary' },
    { href: '/contrats', label: 'Souscrire', sub: 'Choisissez votre formule', icon: Plus, color: 'success' },
    { href: '/sinistres', label: 'Déclarer', sub: 'Un sinistre', icon: AlertTriangle, color: 'warning' },
    { href: '/reclamations', label: 'Support', sub: 'Une question ?', icon: MessageSquare, color: 'info' },
  ];


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Tableau de bord
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>
              {greeting}, {user?.username} 👋
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              Bienvenue sur votre espace personnel. Gérez tous vos contrats et suivis en un clin d'œil.
            </p>
          </div>
          
          {/* Quick stats badge */}
          <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={20} color="var(--primary)" />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Protection active</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{stats.activeContracts} contrat{stats.activeContracts > 1 ? 's' : ''} en cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((card, index) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }} className={`animate-fade-up-${index + 1}`}>
            <div className="stat-card" style={{ cursor: 'pointer', padding: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={18} color={`var(--${card.color})`} />
                </div>
                {card.pending !== undefined && card.pending > 0 && (
                  <span className="badge badge-warning" style={{ fontSize: 9 }}>
                    {card.pending} en attente
                  </span>
                )}
                {card.total !== undefined && (
                  <span className="badge badge-info" style={{ fontSize: 9 }}>
                    Total: {card.total}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{card.value}</p>
              <p style={{ color: 'var(--text-2)', fontSize: 12 }}>{card.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: `var(--${card.color})`, fontSize: 11, fontWeight: 500 }}>
                Voir détails <ChevronRight size={10} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        
        {/* Left Column - Recent Contracts */}
        <div className="card animate-fade-up" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <FileText size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Contrats récents</h2>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Vos 2 derniers contrats souscrits</p>
            </div>
            <Link href="/contrats" className="btn-ghost" style={{ gap: 6, fontSize: 13 }}>
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {recentContracts.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={28} color="var(--primary)" />
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>Aucun contrat pour le moment</p>
              <Link href="/devis" className="btn-primary" style={{ gap: 8 }}>
                <Plus size={14} /> Découvrir les offres
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentContracts.map((contract, idx) => (
                <Link 
                  key={contract._id} 
                  href={`/contrats/${contract._id}`} 
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1rem',
                    background: 'var(--surface-2)',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 12, 
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FileText size={20} color="white" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{contract.type}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                          {contract.numeroContrat}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                          <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                          {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={contract.status} size="sm" />
                    <p style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{contract.price} DT</p>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Quick Actions */}
          <div className="card animate-fade-up-2" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Zap size={18} color="var(--accent)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Actions rapides</h2>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Accédez directement aux principales fonctionnalités</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {quickActions.map(({ href, label, sub, icon: Icon, color }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    padding: '1rem',
                    borderRadius: 14,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  className="hover-lift"
                  >
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 12, 
                      background: `var(--${color}-light)`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Icon size={20} color={`var(--${color})`} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}