'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import Sidebar from './Sidebar';

export default function UserLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-sm text-[var(--text-3)]">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="lg:ml-72 transition-all duration-300 flex-1" style={{ minWidth: 0 }}>
        <div style={{
          padding: '1.5rem',
          minHeight: '100vh',
          maxWidth: '1400px',
          marginRight: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}