import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { DemoProvider } from './context/DemoContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calls from './pages/Calls';
import Bookings from './pages/Bookings';
import CallDetails from './pages/CallDetails';
import AuthPage from './pages/AuthPage';
import type { NavState } from './types';

function AppShell() {
  const { session, isLoading } = useAuth();
  const [nav, setNav] = useState<NavState>({ page: 'dashboard' });

  function handleNavigate(next: NavState) {
    setNav(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eoa-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center shadow-glow-blue">
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
          <p className="text-sm text-eoa-text-secondary">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <AdminProvider>
      <AppWithAdmin nav={nav} onNavigate={handleNavigate} />
    </AdminProvider>
  );
}

function AppWithAdmin({ nav, onNavigate }: { nav: NavState; onNavigate: (nav: NavState) => void }) {
  const { effectiveUserIds } = useAdmin();

  return (
    <DemoProvider effectiveUserIds={effectiveUserIds}>
      <Layout nav={nav} onNavigate={onNavigate}>
        {nav.page === 'dashboard' && <Dashboard onNavigate={onNavigate} />}
        {nav.page === 'calls' && <Calls onNavigate={onNavigate} />}
        {nav.page === 'bookings' && <Bookings onNavigate={onNavigate} />}
        {nav.page === 'call-details' && nav.callId && (
          <CallDetails callId={nav.callId} onNavigate={onNavigate} />
        )}
      </Layout>
    </DemoProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
