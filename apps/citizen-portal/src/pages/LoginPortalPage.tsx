export default function LoginPortalPage() {
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000';
  const workerAppUrl = import.meta.env.VITE_WORKER_APP_URL || 'http://localhost:3001';

  return (
    <div className="animate-fade-in-up flex justify-center">
      <div className="card-surface p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-text-primary">Staff Login</h2>
        <p className="text-text-secondary text-sm mt-2 mb-6">Select your role to continue</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { window.location.href = `${dashboardUrl}/login`; }}
            className="btn-primary w-full"
          >
            Admin / Supervisor
          </button>
          <button
            onClick={() => { window.location.href = `${workerAppUrl}/login`; }}
            className="w-full px-4 py-2.5 rounded-lg border border-safe/30 bg-safe-muted text-safe font-medium hover:bg-safe/20 transition-colors"
          >
            Worker
          </button>
        </div>
      </div>
    </div>
  );
}
