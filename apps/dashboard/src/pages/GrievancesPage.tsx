import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function GrievancesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['grievances', statusFilter],
    queryFn: () => api.get<{ data: any[] }>(`/public/grievances${statusFilter ? `?status=${statusFilter}` : ''}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, resolutionNotes }: any) =>
      api.put(`/public/grievances/${id}/status`, { status, resolutionNotes }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grievances'] }); setSelected(null); },
  });

  const grievances = data?.data ?? [];
  const statusVariant = (s: string) => {
    if (s === 'RESOLVED' || s === 'CLOSED') return 'success';
    if (s === 'IN_PROGRESS') return 'info';
    if (s === 'UNDER_REVIEW') return 'warning';
    return 'default';
  };

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Grievances ({grievances.length})</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark">
          <option value="">All</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {grievances.map((g: any) => (
          <div key={g.id} onClick={() => setSelected(g)}
            className="card-surface p-4 cursor-pointer hover:shadow-card-hover transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm text-text-primary">{g.issueType}</p>
                <p className="text-sm text-text-secondary mt-1">{g.description?.slice(0, 100)}</p>
                <p className="text-xs text-text-muted mt-2">By {g.reporterName} — {new Date(g.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant(g.status)}>{g.status}</Badge>
                <p className="text-xs text-text-muted mt-1 font-mono">{g.trackingCode}</p>
              </div>
            </div>
          </div>
        ))}
        {grievances.length === 0 && <p className="text-center text-text-muted py-10">No grievances</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Grievance Detail" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-text-muted">Reporter</p><p className="text-sm text-text-primary">{selected.reporterName}</p></div>
              <div><p className="text-xs text-text-muted">Phone</p><p className="text-sm text-text-primary">{selected.reporterPhone}</p></div>
              <div><p className="text-xs text-text-muted">Issue Type</p><p className="text-sm text-text-primary">{selected.issueType}</p></div>
              <div><p className="text-xs text-text-muted">Tracking Code</p><p className="text-sm font-mono text-text-primary">{selected.trackingCode}</p></div>
            </div>
            <div><p className="text-xs text-text-muted">Description</p><p className="text-sm text-text-secondary">{selected.description}</p></div>
            {selected.address && <div><p className="text-xs text-text-muted">Address</p><p className="text-sm text-text-secondary">{selected.address}</p></div>}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Resolution Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                className="input-dark w-full" rows={3} />
              <div className="flex space-x-2 mt-3">
                {['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                  <button key={s} onClick={() => updateMutation.mutate({ id: selected.id, status: s, resolutionNotes: notes })}
                    className="px-3 py-1 rounded text-xs bg-surface-elevated text-text-secondary border border-border hover:bg-surface-hover transition-colors">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
