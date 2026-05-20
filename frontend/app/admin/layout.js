'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (pathname === '/admin/login') return;
      if (!user) router.push('/admin/login');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="spinner"></div>
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="lg:ml-72 transition-all duration-300 flex-1" style={{ minWidth: 0 }}>
        <div style={{ padding: '1.5rem', minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
