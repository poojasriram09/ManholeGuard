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

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      <div className="flex space-x-4 mb-4">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border-gray-300 border px-3 py-2 text-sm">
          <option value="">All Actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="text" placeholder="Entity type..." value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border-gray-300 border px-3 py-2 text-sm" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{log.user?.email || '—'}</td>
                <td className="px-6 py-4 text-sm font-medium">{log.action}</td>
                <td className="px-6 py-4 text-sm">{log.entityType}</td>
                <td className="px-6 py-4 text-sm font-mono text-xs">{log.entityId?.slice(0, 8) || '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
