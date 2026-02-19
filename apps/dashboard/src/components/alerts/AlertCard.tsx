import Badge from '../common/Badge';

interface AlertCardProps {
  alert: any;
  onAcknowledge?: (id: string) => void;
}

const typeVariant: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  SOS: 'danger',
  OVERSTAY: 'warning',
  GAS: 'danger',
  CHECKIN_MISSED: 'warning',
  FATIGUE: 'info',
};

const typeIcons: Record<string, React.ReactNode> = {
  SOS: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  OVERSTAY: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  GAS: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  CHECKIN_MISSED: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" /></svg>,
  FATIGUE: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
};

export default function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const variant = typeVariant[alert.type] ?? 'default';
  const borderColor =
    variant === 'danger' ? 'border-danger' :
    variant === 'warning' ? 'border-caution' :
    'border-accent';

  const iconColor =
    variant === 'danger' ? 'text-danger' :
    variant === 'warning' ? 'text-caution' :
    'text-accent';

  return (
    <div className={`card-surface border-l-4 ${borderColor} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`shrink-0 ${iconColor}`}>{typeIcons[alert.type] ?? typeIcons.SOS}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={variant}>{alert.type}</Badge>
              {alert.status && (
                <Badge variant={alert.status === 'RESOLVED' ? 'success' : 'default'}>{alert.status}</Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary truncate">{alert.message ?? 'Alert triggered'}</p>
            <p className="text-xs text-text-muted mt-1">{alert.time ? new Date(alert.time).toLocaleString() : ''}</p>
          </div>
        </div>
        {onAcknowledge && alert.status !== 'ACKNOWLEDGED' && alert.status !== 'RESOLVED' && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="shrink-0 px-3 py-1 text-xs font-medium text-accent bg-accent-muted border border-accent/20 rounded hover:bg-accent/20 transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
