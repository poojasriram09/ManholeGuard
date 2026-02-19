import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="bg-surface-card/80 backdrop-blur-lg border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-text-muted hover:text-text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
          </span>
          <span className="text-xs font-mono font-semibold text-live tracking-wider uppercase">Live</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-text-primary">{user?.email}</p>
          <p className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase() ?? 'supervisor'}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center">
          <span className="text-xs font-semibold text-accent-strong">{initials}</span>
        </div>
      </div>
    </header>
  );
}
