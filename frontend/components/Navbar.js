'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, CreditCard, AlertTriangle,
  MessageSquare, Newspaper, Calculator, Users, Settings,
  Menu, X, LogOut, User, Shield, Bell, ChevronDown,
  Search, Sparkles, Sun, Moon
} from 'lucide-react';

const userLinks = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/contrats', label: 'Contrats', icon: FileText },
  { href: '/paiements', label: 'Paiements', icon: CreditCard },
  { href: '/sinistres', label: 'Sinistres', icon: AlertTriangle },
  { href: '/reclamations', label: 'Réclamations', icon: MessageSquare },
  { href: '/actualites', label: 'Actualités', icon: Newspaper },
];

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/contrats', label: 'Contrats', icon: FileText },
  { href: '/admin/sinistres', label: 'Sinistres', icon: AlertTriangle },
  { href: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { href: '/admin/reclamations', label: 'Réclamations', icon: MessageSquare },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-md' : 'bg-transparent'
      }`} style={{ backdropFilter: scrolled ? 'blur(20px)' : 'none' }}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-inter font-bold text-xl tracking-tight text-[var(--text)]">
                  Smart<span className="text-[var(--primary)]">Assur</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((l) => {
                const Icon = l.icon;
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active 
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] shadow-sm' 
                        : 'text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-[var(--text-3)] hover:bg-[var(--bg-2)] hover:text-[var(--text)] transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--danger)] rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-2)] transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--text)]">{user?.username || 'Utilisateur'}</p>
                    <p className="text-xs text-[var(--text-3)] capitalize">{user?.role || 'client'}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden z-50 animate-scale-in">
                      <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
                        <p className="text-xs text-[var(--text-3)]">Connecté en tant que</p>
                        <p className="text-sm font-semibold text-[var(--text)]">{user?.email || user?.username}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text)] transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          Mon profil
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl text-[var(--text-2)] hover:bg-[var(--bg-2)] transition-all duration-200"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[var(--surface)] z-40 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full overflow-y-auto">
            {/* User Info in Mobile */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-semibold text-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{user?.username || 'Utilisateur'}</p>
                  <p className="text-xs text-[var(--text-3)] capitalize">{user?.email || user?.role || 'client'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              {links.map((l) => {
                const Icon = l.icon;
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {l.label}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-[var(--border)]">
              <Link
                href="/profil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--text-2)] hover:bg-[var(--bg-2)] transition-all duration-200"
              >
                <User className="w-5 h-5" />
                Mon profil
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all duration-200 mt-2"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-[72px]" />
    </>
  );
}