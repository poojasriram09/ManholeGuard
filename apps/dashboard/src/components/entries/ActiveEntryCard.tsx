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
    ratio >= 1 ? 'border-red-500' :
    ratio >= 0.75 ? 'border-yellow-500' :
    'border-gray-200';

  const stateVariant =
    entry.state === 'OVERSTAY_ALERT' || entry.state === 'SOS_TRIGGERED' || entry.state === 'GAS_ALERT'
      ? 'danger'
      : entry.state === 'CHECKIN_MISSED'
        ? 'warning'
        : 'info';

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 ${borderColor} bg-white p-4 shadow-sm transition hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate">{entry.worker?.name ?? 'Unknown Worker'}</h3>
        <Badge variant={stateVariant}>{entry.state}</Badge>
      </div>
      <p className="text-sm text-gray-500 truncate">
        {entry.manhole?.area ?? 'Unknown'} &mdash; {entry.manhole?.qrCodeId ?? ''}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-lg font-bold ${ratio >= 1 ? 'text-red-600' : ratio >= 0.75 ? 'text-yellow-600' : 'text-gray-800'}`}>
          {minutes} min
        </span>
        <span className="text-xs text-gray-400">/ {allowed} min allowed</span>
      </div>
      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${ratio >= 1 ? 'bg-red-500' : ratio >= 0.75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
