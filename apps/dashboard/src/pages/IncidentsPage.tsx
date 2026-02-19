import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function IncidentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get<{ data: any[] }>('/incidents'),
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;
  const incidents = data?.data ?? [];

  const severityColors: Record<string, string> = {
    LOW: 'bg-accent-muted text-accent-strong border border-accent/20',
    MEDIUM: 'bg-caution-muted text-caution border border-caution/20',
    HIGH: 'bg-caution-muted text-caution border border-caution/20',
    CRITICAL: 'bg-danger-muted text-danger border border-danger/20',
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Incidents</h1>
      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incidents.map((inc: any) => (
              <tr key={inc.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary">{inc.incidentType}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{inc.manhole?.area}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{inc.worker?.name || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[inc.severity]}`}>{inc.severity}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{inc.resolved ? 'Resolved' : 'Open'}</td>
                <td className="px-6 py-4 text-sm text-text-muted">{new Date(inc.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
