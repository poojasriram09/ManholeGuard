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

const typeIcon: Record<string, string> = {
  SOS: '🚨',
  OVERSTAY: '⏱',
  GAS: '☠',
  CHECKIN_MISSED: '📵',
  FATIGUE: '😴',
};

export default function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const variant = typeVariant[alert.type] ?? 'default';
  const borderColor =
    variant === 'danger' ? 'border-red-400' :
    variant === 'warning' ? 'border-yellow-400' :
    'border-blue-400';

  return (
    <div className={`border-l-4 ${borderColor} bg-white rounded-lg shadow-sm p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-lg shrink-0">{typeIcon[alert.type] ?? '!'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={variant}>{alert.type}</Badge>
              {alert.status && (
                <Badge variant={alert.status === 'RESOLVED' ? 'success' : 'default'}>{alert.status}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 truncate">{alert.message ?? 'Alert triggered'}</p>
            <p className="text-xs text-gray-400 mt-1">{alert.time ? new Date(alert.time).toLocaleString() : ''}</p>
          </div>
        </div>
        {onAcknowledge && alert.status !== 'ACKNOWLEDGED' && alert.status !== 'RESOLVED' && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="shrink-0 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
