'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, FileText, AlertTriangle, MessageSquare, DollarSign, 
  Newspaper, Calculator, CreditCard, BarChart3, TrendingUp, 
  ArrowRight, Shield, Activity, Clock, CheckCircle, XCircle,
  Calendar, Download, Eye, MoreHorizontal, Sparkles, Zap
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => {
        setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  );

  const statCards = [
    { 
      label: 'Utilisateurs', 
      value: stats?.users || 0, 
      href: '/admin/utilisateurs', 
      icon: Users, 
      color: 'primary',
      bg: 'var(--primary-light)'
    },
    { 
      label: 'Dossiers en attente', 
      value: stats?.pendingContracts || 0, 
      href: '/admin/contrats', 
      icon: FileText, 
      color: 'warning',
      bg: 'var(--warning-light)'
    },
    { 
      label: 'Contrats actifs', 
      value: stats?.activeContracts || 0, 
      href: '/admin/contrats', 
      icon: Shield, 
      color: 'success',
      bg: 'var(--success-light)'
    },
    { 
      label: 'Sinistres', 
      value: stats?.claims || 0, 
      href: '/admin/sinistres', 
      icon: AlertTriangle, 
      color: 'warning',
      bg: 'var(--warning-light)'
    },
    { 
      label: 'Réclamations', 
      value: stats?.reclamations || 0, 
      href: '/admin/reclamations', 
      icon: MessageSquare, 
      color: 'info',
      bg: 'var(--info-light)'
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', icon: Clock, color: 'warning' },
      approved: { label: 'Approuvé', icon: CheckCircle, color: 'success' },
      rejected: { label: 'Rejeté', icon: XCircle, color: 'danger' },
      processing: { label: 'En cours', icon: Activity, color: 'info' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge badge-${config.color}`} style={{ fontSize: 11 }}>
        <config.icon size={11} style={{ marginRight: 4 }} />
        {config.label}
      </span>
    );
  };

  const quickActions = [
    { icon: Users,     label: 'Gérer les utilisateurs', href: '/admin/utilisateurs', color: 'primary' },
    { icon: FileText,  label: 'Gérer les souscriptions', href: '/admin/contrats', color: 'success' },
    { icon: Newspaper, label: 'Publier une actualité',   href: '/admin/actualites/ajouter', color: 'accent' },
    { icon: CreditCard,label: 'Suivre les paiements',    href: '/admin/paiements', color: 'info' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Administration
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>
              Tableau de bord
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              Bienvenue dans votre espace d'administration. Gérez l'ensemble de la plateforme depuis un seul endroit.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="card animate-fade-up-1" style={{ marginBottom: 24, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TrendingUp size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Revenus des paiements</h2>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Primes encaissées par type — {stats?.year || new Date().getFullYear()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Type breakdown totals */}
            {[
              { key: 'Auto', label: 'Automobile', color: '#2684FF' },
              { key: 'Vie',  label: 'Vie',         color: '#36B37E' },
              { key: 'Vol',  label: 'Voyage',      color: '#8777D9' },
            ].map(t => (
              <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: t.color }}>
                    {(stats?.revenueByType?.[t.key] || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT
                  </p>
                </div>
              </div>
            ))}
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>Total</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>
                {(stats?.totalRevenue || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT
              </p>
            </div>
            <Link href="/admin/paiements" className="btn-ghost" style={{ gap: 6, fontSize: 12 }}>
              Voir paiements <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats?.monthlyRevenue || []}
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => [`${value.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT`, name === 'Auto' ? 'Automobile' : name === 'Vol' ? 'Voyage' : name]}
                labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                cursor={{ fill: 'var(--border)', opacity: 0.4, radius: 4 }}
              />
              <Legend
                formatter={v => v === 'Auto' ? 'Automobile' : v === 'Vol' ? 'Voyage' : v}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Bar dataKey="Auto" stackId="a" fill="#2684FF" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Vie"  stackId="a" fill="#36B37E" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Vol"  stackId="a" fill="#8777D9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Empty state */}
        {!stats?.monthlyRevenue?.some(m => m.total > 0) && (
          <div style={{ textAlign: 'center', padding: '2rem 0', marginTop: -240 }}>
            <BarChart3 size={48} color="var(--border)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Aucun paiement enregistré cette année</p>
          </div>
        )}
      </div>

      {/* Stats Grid - Reduced card sizes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        {statCards.map(({ label, value, href, icon: Icon, color, bg }, index) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }} className={`animate-fade-up-${index + 1}`}>
            <div className="stat-card" style={{ cursor: 'pointer', padding: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={`var(--${color})`} />
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{value}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, marginBottom: 4 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 11, fontWeight: 500 }}>
                Voir <ArrowRight size={10} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Claims by Status */}
        <div className="card animate-fade-up-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Sinistres par statut</h2>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Distribution des sinistres en cours</p>
            </div>
            <Link href="/admin/sinistres" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
              Tout voir
            </Link>
          </div>

          {!stats?.claimsByStatus?.length ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Aucune donnée disponible</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.claimsByStatus.map((item) => {
                const total = stats.claimsByStatus.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const statusColors = {
                  pending: 'warning',
                  approved: 'success',
                  rejected: 'danger',
                  processing: 'info'
                };
                return (
                  <div key={item._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{item._id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: `var(--${statusColors[item._id] || 'primary'})` }}>{item.count}</span>
                    </div>
                    <div style={{ background: 'var(--bg-2)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: 8,
                        background: `var(--${statusColors[item._id] || 'primary'})`,
                        borderRadius: 8,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card animate-fade-up-5">
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Actions rapides</h2>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Accédez directement aux tâches fréquentes</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {quickActions.map(({ icon: Icon, label, href, color }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="hover-lift" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.75rem', borderRadius: 12,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `var(--${color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={`var(--${color})`} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}