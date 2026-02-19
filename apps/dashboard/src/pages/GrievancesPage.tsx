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

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Grievances ({grievances.length})</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-gray-300 border px-3 py-2 text-sm">
          <option value="">All</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {grievances.map((g: any) => (
          <div key={g.id} onClick={() => setSelected(g)}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{g.issueType}</p>
                <p className="text-sm text-gray-600 mt-1">{g.description?.slice(0, 100)}</p>
                <p className="text-xs text-gray-400 mt-2">By {g.reporterName} — {new Date(g.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant(g.status)}>{g.status}</Badge>
                <p className="text-xs text-gray-400 mt-1 font-mono">{g.trackingCode}</p>
              </div>
            </div>
          </div>
        ))}
        {grievances.length === 0 && <p className="text-center text-gray-400 py-10">No grievances</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Grievance Detail" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Reporter</p><p className="text-sm">{selected.reporterName}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm">{selected.reporterPhone}</p></div>
              <div><p className="text-xs text-gray-500">Issue Type</p><p className="text-sm">{selected.issueType}</p></div>
              <div><p className="text-xs text-gray-500">Tracking Code</p><p className="text-sm font-mono">{selected.trackingCode}</p></div>
            </div>
            <div><p className="text-xs text-gray-500">Description</p><p className="text-sm">{selected.description}</p></div>
            {selected.address && <div><p className="text-xs text-gray-500">Address</p><p className="text-sm">{selected.address}</p></div>}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">Resolution Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm" rows={3} />
              <div className="flex space-x-2 mt-3">
                {['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                  <button key={s} onClick={() => updateMutation.mutate({ id: selected.id, status: s, resolutionNotes: notes })}
                    className="px-3 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
