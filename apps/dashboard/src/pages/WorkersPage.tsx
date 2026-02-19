import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function WorkersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get<{ data: any[] }>('/workers'),
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;
  const workers = data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Workers ({workers.length})</h1>
      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {workers.map((w: any) => (
              <tr key={w.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-text-primary">{w.employeeId}</td>
                <td className="px-6 py-4 text-sm font-medium text-text-primary">{w.name}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{w.phone}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{w.supervisor?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.user?.isActive ? 'bg-safe-muted text-safe border border-safe/20' : 'bg-surface-elevated text-text-muted border border-border'}`}>
                    {w.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
