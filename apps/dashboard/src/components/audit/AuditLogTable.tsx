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
      <div className="card-surface p-6 text-center text-text-muted">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Entity Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log, i) => (
              <tr key={log.id || i} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">
                  {log.userName || log.userId || 'System'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-text-primary">{log.action}</span>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{log.entityType}</td>
                <td className="px-4 py-3 text-sm text-text-muted font-mono text-xs">{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
