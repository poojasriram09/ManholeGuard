import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get<{ data: any[] }>('/tasks'),
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;
  const tasks = data?.data ?? [];

  const statusColors: Record<string, string> = {
    pending: 'bg-surface-elevated text-text-muted border border-border',
    in_progress: 'bg-accent-muted text-accent-strong border border-accent/20',
    completed: 'bg-safe-muted text-safe border border-safe/20',
    cancelled: 'bg-danger-muted text-danger border border-danger/20',
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Tasks</h1>
      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((t: any) => (
              <tr key={t.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 text-sm capitalize text-text-primary">{t.taskType}</td>
                <td className="px-6 py-4 text-sm capitalize text-text-secondary">{t.priority}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status] || ''}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{t.supervisor?.name}</td>
                <td className="px-6 py-4 text-sm text-text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
