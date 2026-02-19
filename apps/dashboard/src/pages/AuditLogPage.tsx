import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter, entityFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entityType', entityFilter);
      return api.get<{ data: any[] }>(`/audit?${params.toString()}`);
    },
  });

  const logs = data?.data ?? [];
  const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SCAN', 'ENTRY_START', 'ENTRY_EXIT',
    'ALERT_TRIGGERED', 'ALERT_ACKNOWLEDGED', 'SOS_ACTIVATED', 'CHECKIN_RESPONSE', 'CHECKIN_MISSED'];

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Audit Log</h1>

      <div className="flex space-x-4 mb-4">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="input-dark">
          <option value="">All Actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="text" placeholder="Entity type..." value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="input-dark" />
      </div>

      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 text-sm text-text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{log.user?.email || '—'}</td>
                <td className="px-6 py-4 text-sm font-medium text-text-primary">{log.action}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{log.entityType}</td>
                <td className="px-6 py-4 text-sm font-mono text-xs text-text-muted">{log.entityId?.slice(0, 8) || '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-text-muted">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
