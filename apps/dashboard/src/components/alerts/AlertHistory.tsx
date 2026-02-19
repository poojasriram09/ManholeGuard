import { useState, useMemo } from 'react';
import AlertCard from './AlertCard';

interface AlertHistoryProps {
  alerts: any[];
}

const PAGE_SIZE = 10;
const ALERT_TYPES = ['ALL', 'SOS', 'OVERSTAY', 'GAS', 'CHECKIN_MISSED', 'FATIGUE'] as const;

export default function AlertHistory({ alerts }: AlertHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...alerts].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    if (typeFilter !== 'ALL') result = result.filter((a) => a.type === typeFilter);
    if (dateFrom) result = result.filter((a) => new Date(a.time) >= new Date(dateFrom));
    if (dateTo) result = result.filter((a) => new Date(a.time) <= new Date(dateTo + 'T23:59:59'));
    return result;
  }, [alerts, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFilterChange = () => setPage(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-surface-elevated rounded-lg p-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); handleFilterChange(); }}
            className="input-dark"
          >
            {ALERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">From</label>
          <input
            type="date" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
            className="input-dark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">To</label>
          <input
            type="date" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
            className="input-dark"
          />
        </div>
        <span className="text-xs text-text-muted self-center">{filtered.length} results</span>
      </div>

      <div className="space-y-2">
        {paged.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No alerts match filters</p>
        )}
        {paged.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-text-secondary">Page {page + 1} of {totalPages}</span>
          <div className="space-x-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1 rounded text-sm bg-surface-elevated border border-border text-text-secondary disabled:opacity-50 hover:bg-surface-hover transition-colors">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded text-sm bg-surface-elevated border border-border text-text-secondary disabled:opacity-50 hover:bg-surface-hover transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
