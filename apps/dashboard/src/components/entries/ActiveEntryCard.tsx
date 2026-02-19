import Badge from '../common/Badge';

interface ActiveEntryCardProps {
  entry: any;
  onClick?: () => void;
}

function getElapsedMinutes(entryTime: string): number {
  return Math.round((Date.now() - new Date(entryTime).getTime()) / 60000);
}

export default function ActiveEntryCard({ entry, onClick }: ActiveEntryCardProps) {
  const minutes = entry.entryTime ? getElapsedMinutes(entry.entryTime) : 0;
  const allowed = entry.allowedDurationMinutes ?? 120;
  const ratio = minutes / allowed;

  const borderColor =
    ratio >= 1 ? 'border-danger' :
    ratio >= 0.75 ? 'border-caution' :
    'border-border';

  const shadowClass = ratio >= 1 ? 'shadow-glow-danger' : '';

  const stateVariant =
    entry.state === 'OVERSTAY_ALERT' || entry.state === 'SOS_TRIGGERED' || entry.state === 'GAS_ALERT'
      ? 'danger'
      : entry.state === 'CHECKIN_MISSED'
        ? 'warning'
        : 'info';

  return (
    <div
      onClick={onClick}
      className={`card-surface border-2 ${borderColor} p-4 transition-all duration-200 hover:shadow-card-hover ${shadowClass} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-text-primary truncate">{entry.worker?.name ?? 'Unknown Worker'}</h3>
        <Badge variant={stateVariant}>{entry.state}</Badge>
      </div>
      <p className="text-sm text-text-muted truncate">
        {entry.manhole?.area ?? 'Unknown'} &mdash; {entry.manhole?.qrCodeId ?? ''}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-lg font-heading font-bold ${ratio >= 1 ? 'text-danger' : ratio >= 0.75 ? 'text-caution' : 'text-text-primary'}`}>
          {minutes} min
        </span>
        <span className="text-xs text-text-muted">/ {allowed} min allowed</span>
      </div>
      <div className="mt-2 w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full animate-progress-fill ${ratio >= 1 ? 'bg-danger' : ratio >= 0.75 ? 'bg-caution' : 'bg-accent'}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
