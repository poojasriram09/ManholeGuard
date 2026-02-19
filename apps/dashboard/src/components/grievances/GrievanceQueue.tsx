import { useState } from 'react';
import Badge from '../common/Badge';

interface Grievance {
  id: string;
  subject?: string;
  description?: string;
  status: string;
  createdAt: string;
  citizenName?: string;
  category?: string;
}

interface GrievanceQueueProps {
  grievances: Grievance[];
  onSelect: (id: string) => void;
}

const statusVariant: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  OPEN: 'danger',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export default function GrievanceQueue({ grievances, onSelect }: GrievanceQueueProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = statusFilter === 'ALL'
    ? grievances
    : grievances.filter((g) => g.status === statusFilter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="card-surface">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-heading font-semibold text-text-primary">Grievances ({filtered.length})</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark">
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      {sorted.length === 0 ? (
        <div className="p-6 text-center text-text-muted">No grievances found.</div>
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((g) => (
            <li key={g.id} onClick={() => onSelect(g.id)}
              className="px-4 py-3 hover:bg-surface-hover cursor-pointer flex items-center gap-3 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{g.subject || g.id}</p>
                <p className="text-xs text-text-muted">
                  {g.citizenName || 'Anonymous'} &middot; {new Date(g.createdAt).toLocaleDateString()}
                  {g.category && ` &middot; ${g.category}`}
                </p>
              </div>
              <Badge variant={statusVariant[g.status] || 'default'}>{g.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
