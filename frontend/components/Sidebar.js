'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import {
  LayoutDashboard, FileText, CreditCard, AlertTriangle,
  MessageSquare, Newspaper, Calculator, Users, Settings,
  LogOut, User, Shield, Menu, X, ChevronRight,
  BarChart3, Bell, HelpCircle, TrendingUp, Award,
  Sparkles, ChevronLeft
} from 'lucide-react';

const userNav = [
  { href: '/dashboard',      label: 'Tableau de bord', icon: LayoutDashboard, color: 'primary' },
  { href: '/souscription',   label: 'Souscription',    icon: Calculator, color: 'accent' },
  { href: '/contrats',       label: 'Mes contrats',    icon: FileText, color: 'secondary' },
  { href: '/paiements',      label: 'Paiements',       icon: CreditCard, color: 'success' },
  { href: '/sinistres',      label: 'Sinistres',       icon: AlertTriangle, color: 'warning' },
  { href: '/reclamations',   label: 'Réclamations',    icon: MessageSquare, color: 'info' },
];

const adminNav = [
  { href: '/admin',                   label: 'Vue d\'ensemble',  icon: BarChart3, color: 'primary' },
  { href: '/admin/utilisateurs',      label: 'Utilisateurs',     icon: Users, color: 'secondary' },
  { href: '/admin/contrats',          label: 'Souscriptions',    icon: FileText, color: 'success' },
  { href: '/admin/sinistres',         label: 'Sinistres',        icon: AlertTriangle, color: 'warning' },
  { href: '/admin/paiements',         label: 'Paiements',        icon: CreditCard, color: 'info' },
  { href: '/admin/reclamations',      label: 'Réclamations',     icon: MessageSquare, color: 'accent' },
  { href: '/admin/actualites',        label: 'Actualités',       icon: Newspaper, color: 'primary' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const nav = user?.role === 'admin' ? adminNav : userNav;

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={`px-4 py-6 border-b border-[var(--border)] transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <span className="font-inter font-bold text-xl tracking-tight text-[var(--text)]">Smart</span>
              <span className="font-inter font-bold text-xl tracking-tight text-[var(--primary)]">Assur</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className={`px-4 ${collapsed ? 'px-2' : ''} space-y-6`}>
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-4)] px-3 mb-1">
                {user?.role === 'admin' ? 'Administration' : 'Navigation principale'}
              </p>
            )}
            <div className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active 
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] shadow-sm' 
                        : 'text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={collapsed ? 20 : 18} className={`flex-shrink-0 ${active ? 'text-[var(--primary)]' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {active && <ChevronRight size={14} className="text-[var(--primary)]" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compte Section */}
          <div>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-4)] px-3 mb-1">
                Compte
              </p>
            )}
            <div className="space-y-1">
              <Link
                href="/profil"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${pathname === '/profil' 
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]' 
                    : 'text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? 'Mon profil' : ''}
              >
                <User size={collapsed ? 20 : 18} />
                {!collapsed && <span className="text-sm font-medium">Mon profil</span>}
              </Link>
              <button
                onClick={logout}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  text-[var(--danger)] hover:bg-[var(--danger-light)] group
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? 'Déconnexion' : ''}
              >
                <LogOut size={collapsed ? 20 : 18} className="group-hover:scale-105 transition-transform" />
                {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>

          </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-inter font-bold text-[var(--text)]">Smart<span className="text-[var(--primary)]">Assur</span></span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] transition-all duration-200 active:scale-95"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 z-50 bg-[var(--surface)] border-r border-[var(--border)]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}