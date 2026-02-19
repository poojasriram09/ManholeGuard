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
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Grievances ({filtered.length})</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      {sorted.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No grievances found.</div>
      ) : (
        <ul className="divide-y">
          {sorted.map((g) => (
            <li key={g.id} onClick={() => onSelect(g.id)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{g.subject || g.id}</p>
                <p className="text-xs text-gray-500">
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
