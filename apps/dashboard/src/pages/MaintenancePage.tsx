import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import Badge from '../components/common/Badge';

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', statusFilter],
    queryFn: () => api.get<{ data: any[] }>(`/maintenance${statusFilter ? `?status=${statusFilter}` : ''}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.put(`/maintenance/${id}/status`, { status, notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });

  const items = data?.data ?? [];
  const statusVariant = (s: string) => {
    if (s === 'COMPLETED') return 'success';
    if (s === 'OVERDUE') return 'danger';
    if (s === 'IN_PROGRESS') return 'info';
    if (s === 'CANCELLED') return 'default';
    return 'warning';
  };

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Maintenance ({items.length})</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark">
          <option value="">All Statuses</option>
          {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Manhole</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((m: any) => (
              <tr key={m.id} className={m.status === 'OVERDUE' ? 'bg-danger-muted/30' : 'hover:bg-surface-hover transition-colors'}>
                <td className="px-6 py-4 text-sm text-text-secondary">{m.manhole?.area} — {m.manhole?.qrCodeId}</td>
                <td className="px-6 py-4 text-sm capitalize text-text-secondary">{m.type}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{new Date(m.scheduledAt).toLocaleDateString()}</td>
                <td className="px-6 py-4"><Badge variant={statusVariant(m.status)}>{m.status}</Badge></td>
                <td className="px-6 py-4 text-sm text-text-secondary">{m.assignedTeam || '—'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {m.status === 'SCHEDULED' && (
                    <button onClick={() => updateMutation.mutate({ id: m.id, status: 'IN_PROGRESS' })}
                      className="text-accent hover:underline text-xs">Start</button>
                  )}
                  {m.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateMutation.mutate({ id: m.id, status: 'COMPLETED' })}
                      className="text-safe hover:underline text-xs">Complete</button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-text-muted">No maintenance records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
