interface AuditLog {
  id?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log, i) => (
              <tr key={log.id || i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {log.userName || log.userId || 'System'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-gray-800">{log.action}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{log.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
