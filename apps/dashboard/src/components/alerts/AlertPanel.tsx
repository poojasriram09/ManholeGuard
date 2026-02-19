import { useState, useMemo } from 'react';
import AlertCard from './AlertCard';

interface AlertPanelProps {
  alerts: any[];
}

const ALERT_TYPES = ['ALL', 'SOS', 'OVERSTAY', 'GAS', 'CHECKIN_MISSED', 'FATIGUE'] as const;

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    const sorted = [...alerts].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    if (filter === 'ALL') return sorted;
    return sorted.filter((a) => a.type === filter);
  }, [alerts, filter]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        {ALERT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No alerts</p>
        )}
        {filtered.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
