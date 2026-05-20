'use client';
import { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowLeft, Shield, Clock, User } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

export default function ActualitesPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/news').then(({ data }) => setNews(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="glass" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        padding: '1rem 0'
      }}>
        <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 20 }}>
              Smart<span style={{ color: 'var(--primary)' }}>Assur</span>
            </span>
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </nav>

      <div className="container-custom" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Blog</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>Actualités & Nouveautés</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, maxWidth: 560 }}>Découvrez les dernières actualités de SmartAssur et restez informé de nos nouveautés.</p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Newspaper size={40} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Aucune actualité</h3>
            <p style={{ color: 'var(--text-2)' }}>Revenez bientôt pour les dernières nouvelles</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 32 }}>
            {news.map((n, i) => (
              <article key={n._id} className="card" style={{ overflow: 'hidden', padding: 0, animationDelay: `${i * 0.05}s` }}>
                {n.image ? (
                  <img src={`http://localhost:5000/uploads/${n.image}`} alt={n.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: 220, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Newspaper size={56} color="var(--primary)" />
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="var(--text-3)" />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="var(--text-3)" />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Lecture 3 min</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 12, lineHeight: 1.4 }}>{n.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{n.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}