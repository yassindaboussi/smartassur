'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import Link from 'next/link';
import api from '../lib/api';
import {
  Shield, FileText, CreditCard, AlertTriangle, MessageSquare,
  CheckCircle, ArrowRight, Phone, Mail, MapPin, Star,
  Newspaper, ChevronDown, Zap, Lock, Clock, HeartHandshake,
  Car, HeartPulse, Plane, Menu, X, ExternalLink,
  Award, Users, Headphones, TrendingUp, Sparkles,
  Building2, Calendar, Quote, Luggage, Ambulance, Baby, PlaneTakeoff, Clock as ClockIcon
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    api.get('/news').then(({ data }) => setNews(data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── NAVBAR BLEUE MAGNIFIQUE ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled 
          ? 'linear-gradient(135deg, #0A2540 0%, #1A4A6E 100%)'
          : 'linear-gradient(135deg, #0D2B42 0%, #1B5A7A 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled 
          ? '1px solid rgba(255, 255, 255, 0.15)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: scrolled 
          ? '0 8px 32px rgba(0, 0, 0, 0.15)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          position: 'relative'
        }}>
          {/* Logo - gauche avec animation */}
          <Link 
            href="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              textDecoration: 'none', 
              flexShrink: 0,
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #48BBFF, #0066FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(72, 187, 255, 0.3)',
              transition: 'box-shadow 0.2s ease',
            }}>
              <Shield size={20} color="white" strokeWidth={1.8} />
            </div>
            <span style={{ 
              fontFamily: 'Plus Jakarta Sans', 
              fontWeight: 800, 
              fontSize: 22, 
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF, #B3E4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smart<span style={{ 
                background: 'linear-gradient(135deg, #48BBFF, #99D9FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Assur</span>
            </span>
          </Link>

          {/* Menu desktop centré - blanc sur fond bleu */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }} className="desktop-menu">
            {[
              { id: 'offres', label: 'Nos offres' },
              { id: 'avantages', label: 'Avantages' },
              { id: 'actualites', label: 'Actualités' },
              { id: 'contact', label: 'Contact' },
            ].map(({ id, label }) => (
              <a 
                key={id} 
                href={`#${id}`}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                {label}
              </a>
            ))}
          </div>

          {/* Boutons CTA - droite élégants */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Connexion - bouton secondaire */}
            <Link href="/login"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(10px)',
              }}
              className="desktop-login"
              onMouseEnter={e => { 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Connexion
            </Link>
            
            {/* Souscrire - bouton principal avec dégradé vif */}
            <Link href="/register" style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #48BBFF, #0066FF)',
              color: 'white',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 102, 255, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #55C5FF, #1A75FF)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #48BBFF, #0066FF)';
            }}>
              Inscription 
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            
            {/* Bouton menu mobile */}
            <button 
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{
                padding: 8,
                borderRadius: 40,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              className="mobile-menu-btn"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              {mobileMenu ? <X size={20} color="white" /> : <Menu size={20} color="white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - bleu harmonisé */}
        <div 
          className="mobile-menu-container"
          style={{
            background: 'linear-gradient(135deg, #0D2B42 0%, #1B5A7A 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: mobileMenu ? '480px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{
            padding: '1.5rem 32px 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Liens de navigation mobile */}
            {[
              { id: 'offres', label: 'Nos offres' },
              { id: 'avantages', label: 'Avantages' },
              { id: 'actualites', label: 'Actualités' },
              { id: 'contact', label: 'Contact' },
            ].map(({ id, label }) => (
              <a key={id} href={`#${id}`} 
                onClick={() => setMobileMenu(false)}
                style={{
                  padding: '0.875rem 1.25rem',
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
              >
                {label}
              </a>
            ))}
            
            {/* Séparateur élégant */}
            <div style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              height: 1,
              margin: '16px 0 20px',
            }} />
            
            {/* Boutons d'action mobile */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/login" 
                onClick={() => setMobileMenu(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.875rem',
                  borderRadius: 40,
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  textDecoration: 'none',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                Connexion
              </Link>
              <Link href="/register" 
                onClick={() => setMobileMenu(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.875rem',
                  borderRadius: 40,
                  fontSize: 15,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #48BBFF, #0066FF)',
                  color: 'white',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Styles CSS pour la responsivité */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .desktop-login {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-menu {
            display: flex !important;
          }
          .desktop-login {
            display: inline-flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu-container {
            max-height: 0 !important;
          }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, var(--primary-light) 0%, transparent 60%)', opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--secondary-light) 0%, transparent 70%)', opacity: 0.3, pointerEvents: 'none' }} />

        <div className="container-custom" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-light)', borderRadius: 99, padding: '0.375rem 1rem', marginBottom: 28 }}>
              <Sparkles size={14} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Assurance nouvelle génération • Certifiée</span>
            </div>

            <h1 className="animate-fade-up-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Protégez ce qui compte,{' '}
              <span className="gradient-text">simplement.</span>
            </h1>

            <p className="animate-fade-up-2" style={{ fontSize: 18, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
              SmartAssur simplifie vos assurances. Souscrivez, déclarez un sinistre et gérez tous vos contrats en quelques clics, où que vous soyez.
            </p>

            <div className="animate-fade-up-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
              <Link href="/register" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: 16, borderRadius: 14 }}>
                Créer mon compte <ArrowRight size={16} />
              </Link>
              <a href="#offres" className="btn-outline" style={{ padding: '1rem 2rem', fontSize: 16 }}>
                Voir les offres
              </a>
            </div>

            {/* Trust Indicators - Version plus naturelle */}
            <div className="animate-fade-up-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
              {[
                { icon: Lock, label: 'Gestion simplifiée', color: 'var(--primary)' },
                { icon: Headphones, label: 'Support réactif', color: 'var(--secondary)' },
                { icon: ClockIcon, label: 'Souscription rapide', color: 'var(--accent)' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)' }}>
                  <Icon size={16} color={color} />
                  <span style={{ fontSize: 13 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION - Version sans chiffres ── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-custom">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', textAlign: 'center' }}>
            {[
              { icon: Users, text: 'Des milliers de clients nous font confiance' },
              { icon: TrendingUp, text: 'Une satisfaction reconnue par nos utilisateurs' },
              { icon: Clock, text: 'Un traitement rapide de vos sinistres' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={24} color="var(--primary)" />
                <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFERS SECTION ── */}
      <section id="offres" style={{ padding: '5rem 0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Nos offres</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 12 }}>Des solutions sur mesure</h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 560, margin: '0 auto' }}>Des couvertures adaptées à chaque étape de votre vie</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {[
              {
                icon: Car, 
                title: 'Assurance Auto',
                features: [
                  'Responsabilité civile complète',
                  'Protection vol, incendie et bris de glace',
                  'Défense recours et assistance juridique',
                  'Protection conducteur et frais médicaux',
                  'Assistance dépannage 24h/24'
                ],
                color: 'primary', 
                popular: true
              },
              {
                icon: HeartPulse, 
                title: 'Assurance Vie',
                features: [
                  'Frais médicaux & hospitalisation',
                  'Capital invalidité permanente',
                  'Indemnités journalières',
                  'Capital décès au(x) bénéficiaire(s)'
                ],
                color: 'secondary', 
                popular: false
              },
              {
                icon: Plane, 
                title: 'Assurance Voyage',
                features: [
                  '✓ Plafond de remboursement de 30 000€',
                  '✓ Rapatriement sanitaire & accompagnants',
                  '✓ Accompagnement hospitalier (<7j)',
                  '✓ Prise en charge des enfants (-15 ans)',
                  '✓ Retour anticipé (hospitalisation/décès)',
                  '✓ Remboursement bagages perdus/retardés',
                  '✓ Soins dentaires d\'urgence couverts'
                ],
                color: 'accent', 
                popular: false
              },
            ].map(({ icon: Icon, title, features, color, popular }) => (
              <div key={title} className="card" style={{
                position: 'relative',
                borderTop: popular ? `3px solid var(--${color})` : 'none',
                padding: '2rem'
              }}>
                {popular && (
                  <div className="badge badge-primary" style={{ 
                    position: 'absolute', 
                    top: -12, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap'
                  }}>
                    ⭐ Plus populaire
                  </div>
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `var(--${color}-light)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <Icon size={28} color={`var(--${color})`} />
                </div>
                <h3 style={{ fontSize: 22, marginBottom: 24 }}>{title}</h3>
                <ul style={{ marginBottom: 28, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {features.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                      <CheckCircle size={16} color="var(--success)" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  Souscrire <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section id="avantages" style={{ padding: '5rem 0', background: 'var(--surface)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="badge badge-success" style={{ marginBottom: 16, display: 'inline-flex' }}>Pourquoi nous choisir</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 12 }}>L'assurance réinventée</h2>
            <p style={{ color: 'var(--text-2)' }}>Une expérience client sans compromis</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { icon: Zap, title: 'Ultra rapide', desc: 'Souscription en 3 minutes. Déclaration de sinistre instantanée.', color: 'primary' },
              { icon: Lock, title: 'Sécurisé', desc: 'Vos données sont chiffrées et protégées selon les plus hauts standards.', color: 'secondary' },
              { icon: Headphones, title: 'Support 24/7', desc: 'Notre équipe répond à vos questions sous 48 heures.', color: 'accent' },
              { icon: Award, title: 'Certifié', desc: 'Assureur reconnu et labellisé pour la qualité de service.', color: 'primary' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `var(--${color}-light)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <Icon size={28} color={`var(--${color})`} />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ── NEWS SECTION ── */}
      {news.length > 0 && (
        <section id="actualites" style={{ padding: '5rem 0' }}>
          <div className="container-custom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
              <div>
                <p className="badge badge-info" style={{ marginBottom: 12, display: 'inline-flex' }}>Actualités</p>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Restez informé</h2>
              </div>
              <Link href="/actualites" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Toutes les actualités <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
              {news.map((n, index) => (
                <article key={n._id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                  {n.image ? (
                    <img src={`http://localhost:5000/uploads/${n.image}`} alt={n.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 200, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={48} color="var(--primary)" />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Calendar size={14} color="var(--text-3)" />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>{n.title}</h3>
                    <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{n.content.substring(0, 120)}...</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', textAlign: 'center' }}>
        <div className="container-custom">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 16 }}>Prêt à rejoindre SmartAssur ?</h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            Créez votre compte en moins de 2 minutes et accédez à tous nos services.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white', color: 'var(--primary)', padding: '1rem 2rem',
              borderRadius: 14, fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              Créer mon compte <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'white', padding: '1rem 2rem',
              borderRadius: 14, fontWeight: 600, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" style={{ padding: '5rem 0', background: 'var(--surface)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Contact</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Une question ?</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 8 }}>Notre équipe est à votre écoute</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 800, margin: '0 auto' }}>
            {[
            { icon: Phone, title: 'Téléphone', value: '+216 71 831 000', detail: 'Du lundi au vendredi' },
            { icon: Mail, title: 'Email', value: 'contact@bnaassurances.com.tn', detail: 'Réponse sous 24h' },
            { icon: MapPin, title: 'Adresse', value: '8 Rue Hédi Nouira', detail: '1001 Tunis, Tunisie' },
          ].map(({ icon: Icon, title, value, detail }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{value}</p>
                <p style={{ color: 'var(--text-3)', fontSize: 12 }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '3rem 0 2rem', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <div className="container-custom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 20 }}>
                Smart<span style={{ color: 'var(--primary)' }}>Assur</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/login" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none' }}>Connexion</Link>
              <Link href="/register" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Inscription</Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <p style={{ color: 'var(--text-3)', fontSize: 12 }}>© {new Date().getFullYear()} SmartAssur. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}