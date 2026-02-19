import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function ActiveEntriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['active-entries'],
    queryFn: () => api.get<{ data: any[] }>('/entry/active'),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;

  const entries = data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Active Entries ({entries.length})</h1>
      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Entry Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry: any) => {
              const minutes = Math.round((Date.now() - new Date(entry.entryTime).getTime()) / 60000);
              const isOvertime = minutes > entry.allowedDurationMinutes;
              return (
                <tr key={entry.id} className={isOvertime ? 'bg-danger-muted/30' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{entry.worker?.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{entry.manhole?.area} — {entry.manhole?.qrCodeId}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{new Date(entry.entryTime).toLocaleTimeString()}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isOvertime ? 'text-danger' : 'text-text-primary'}`}>{minutes} min</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{entry.state}</td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-text-muted">No active entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
