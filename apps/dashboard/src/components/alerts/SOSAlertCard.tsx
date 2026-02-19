interface SOSAlertCardProps {
  sos: any;
  onResolve?: (id: string) => void;
}

export default function SOSAlertCard({ sos, onResolve }: SOSAlertCardProps) {
  const isResolved = sos.status === 'RESOLVED';

  return (
    <div className={`card-surface border-2 p-4 ${isResolved ? 'border-border' : 'border-danger animate-border-pulse shadow-glow-danger'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-6 h-6 ${isResolved ? 'text-text-muted' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className={`text-lg font-heading font-bold ${isResolved ? 'text-text-secondary' : 'text-danger'}`}>
              SOS ALERT
            </h3>
            {isResolved && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-safe-muted text-safe border border-safe/20">Resolved</span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-text-muted">Worker:</span> <span className="font-medium text-text-primary">{sos.workerName ?? 'Unknown'}</span></p>
            <p><span className="text-text-muted">Location:</span> <span className="font-medium text-text-primary">{sos.location ?? 'Unknown'}</span></p>
            <p><span className="text-text-muted">Trigger:</span> <span className="font-medium text-text-primary">{sos.trigger ?? 'Manual'}</span></p>
            <p><span className="text-text-muted">Time:</span> <span className="font-medium text-text-primary">{sos.time ? new Date(sos.time).toLocaleString() : '---'}</span></p>
            {sos.message && <p className="text-text-secondary mt-1">{sos.message}</p>}
          </div>
        </div>
        {onResolve && !isResolved && (
          <button
            onClick={() => onResolve(sos.id)}
            className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-danger rounded-md hover:bg-danger/80 focus:ring-2 focus:ring-danger transition-colors"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
