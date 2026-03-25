import { LayoutDashboard, Phone, Calendar, Radio, Sparkles, LogOut, User, ShieldCheck } from 'lucide-react';
import { useDemoMode } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import type { Page, NavState } from '../types';

interface LayoutProps {
  nav: NavState;
  onNavigate: (nav: NavState) => void;
  children: React.ReactNode;
}

const navItems = [
  { page: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { page: 'calls' as Page, label: 'Calls', icon: Phone },
  { page: 'bookings' as Page, label: 'Bookings', icon: Calendar },
];

function DemoToggle({ isDemoMode, onToggle }: { isDemoMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
        isDemoMode
          ? 'bg-gradient-brand-soft border border-eoa-purple/25'
          : 'bg-eoa-card border border-eoa-border hover:border-eoa-border-light'
      }`}
    >
      <div
        className={`relative flex-shrink-0 rounded-full transition-all duration-200 ${
          isDemoMode ? 'btn-gradient shadow-glow-blue' : 'bg-eoa-text-muted/30'
        }`}
        style={{ height: '18px', minWidth: '32px' }}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            isDemoMode ? 'translate-x-[14px]' : 'translate-x-0.5'
          }`}
        />
      </div>
      <div className="flex-1 text-left">
        <div className={`text-xs font-semibold leading-tight ${isDemoMode ? 'gradient-text' : 'text-eoa-text-secondary'}`}>
          Demo Mode
        </div>
        <div className="text-[10px] text-eoa-text-muted leading-tight mt-0.5">
          {isDemoMode ? 'Sample data active' : 'No data connected'}
        </div>
      </div>
      {isDemoMode && <Sparkles className="w-3 h-3 text-eoa-purple flex-shrink-0" strokeWidth={2} />}
    </button>
  );
}

export default function Layout({ nav, onNavigate, children }: LayoutProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, username, role, signOut } = useAuth();
  const activePage = nav.page === 'call-details' ? 'calls' : nav.page;
  const isAdmin = role === 'admin';

  const displayName = username ?? user?.email?.split('@')[0] ?? 'Account';

  return (
    <div className="flex h-screen bg-eoa-bg overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 border-r border-eoa-border bg-eoa-surface flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-eoa-border">
          <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center flex-shrink-0 shadow-glow-blue">
            <Radio className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-eoa-text-primary tracking-wide">EOA Media</div>
            <div className="text-[10px] text-eoa-text-secondary uppercase tracking-widest">AI Receptionist</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate({ page })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-brand-soft border border-eoa-blue/20 shadow-glow-blue'
                    : 'text-eoa-text-secondary hover:text-eoa-text-primary hover:bg-eoa-card'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-eoa-blue' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive ? (
                  <span className="gradient-text font-semibold">{label}</span>
                ) : (
                  label
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-eoa-border space-y-3">
          <DemoToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} />

          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eoa-blue opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-eoa-blue" />
            </span>
            <span className="text-[11px] text-eoa-text-secondary">AI Receptionist Active</span>
          </div>

          <div className="flex items-center gap-2 px-1 pt-2 border-t border-eoa-border">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-eoa-amber/10 border border-eoa-amber/25' : 'bg-eoa-blue/10 border border-eoa-blue/20'}`}>
              {isAdmin
                ? <ShieldCheck className="w-3 h-3 text-eoa-amber" strokeWidth={2} />
                : <User className="w-3 h-3 text-eoa-blue" strokeWidth={2} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-eoa-text-secondary truncate block">{displayName}</span>
              {isAdmin && <span className="text-[9px] font-semibold text-eoa-amber uppercase tracking-wider">Admin</span>}
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="text-eoa-text-muted hover:text-eoa-red transition-colors duration-150 flex-shrink-0 p-0.5"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-eoa-border bg-eoa-surface/90 glass flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-bold text-eoa-text-primary leading-tight">EOA Media</div>
              <div className="text-[9px] text-eoa-text-secondary uppercase tracking-widest leading-tight">AI Receptionist</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDemoMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all duration-200 ${
                isDemoMode
                  ? 'bg-gradient-brand-soft border-eoa-purple/30 gradient-text'
                  : 'bg-eoa-card border-eoa-border text-eoa-text-secondary hover:border-eoa-border-light'
              }`}
            >
              <Sparkles className={`w-3 h-3 flex-shrink-0 ${isDemoMode ? 'text-eoa-purple' : 'text-eoa-text-muted'}`} strokeWidth={2} />
              Demo
            </button>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold bg-eoa-card border border-eoa-border text-eoa-text-secondary hover:text-eoa-red hover:border-eoa-red/30 transition-colors duration-150"
            >
              <LogOut className="w-3 h-3" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-eoa-blue/10 border border-eoa-blue/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eoa-blue opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-eoa-blue" />
              </span>
              <span className="text-[10px] font-semibold text-eoa-blue">Live</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-eoa-surface/95 glass border-t border-eoa-border safe-bottom">
          <div className="flex">
            {navItems.map(({ page, label, icon: Icon }) => {
              const isActive = activePage === page;
              return (
                <button
                  key={page}
                  onClick={() => onNavigate({ page })}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-150"
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-eoa-blue' : 'text-eoa-text-secondary'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'gradient-text' : 'text-eoa-text-secondary'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
