import Modal from '../common/Modal';
import Badge from '../common/Badge';

interface EntryDetailModalProps {
  entry: any;
  open: boolean;
  onClose: () => void;
}

function formatDuration(entryTime: string, exitTime?: string): string {
  const start = new Date(entryTime).getTime();
  const end = exitTime ? new Date(exitTime).getTime() : Date.now();
  const mins = Math.round((end - start) / 60000);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const stateVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  ACTIVE: 'info',
  EXITED: 'success',
  OVERSTAY_ALERT: 'warning',
  SOS_TRIGGERED: 'danger',
  GAS_ALERT: 'danger',
  CHECKIN_MISSED: 'warning',
};

export default function EntryDetailModal({ entry, open, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  return (
    <Modal open={open} onClose={onClose} title="Entry Details" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Worker</p>
            <p className="font-medium">{entry.worker?.name ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Manhole</p>
            <p className="font-medium">{entry.manhole?.qrCodeId ?? 'N/A'} &mdash; {entry.manhole?.area ?? ''}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Entry Time</p>
            <p className="font-medium">{entry.entryTime ? new Date(entry.entryTime).toLocaleString() : '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Exit Time</p>
            <p className="font-medium">{entry.exitTime ? new Date(entry.exitTime).toLocaleString() : 'Still underground'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Duration</p>
            <p className="font-medium">{entry.entryTime ? formatDuration(entry.entryTime, entry.exitTime) : '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">State</p>
            <Badge variant={stateVariant[entry.state] ?? 'default'}>{entry.state}</Badge>
          </div>
        </div>

        {entry.checkIns && entry.checkIns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Check-ins ({entry.checkIns.length})</h3>
            <ul className="space-y-1">
              {entry.checkIns.map((ci: any, i: number) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {new Date(ci.time).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.checklist && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Checklist</h3>
            <ul className="space-y-1">
              {entry.checklist.map((item: any, i: number) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className={item.completed ? 'text-green-600' : 'text-red-500'}>
                    {item.completed ? '✓' : '✗'}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
