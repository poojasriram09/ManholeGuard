interface AuditLogFiltersProps {
  filters: {
    action?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
  };
  onChange: (filters: {
    action?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) => void;
}

const actionTypes = [
  '', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
  'ENTRY_START', 'ENTRY_EXIT', 'CHECK_IN', 'SOS_TRIGGER', 'ALERT_ACK',
];

const entityTypes = [
  '', 'MANHOLE', 'WORKER', 'ENTRY', 'ALERT', 'INCIDENT',
  'MAINTENANCE', 'CERTIFICATION', 'GRIEVANCE', 'TASK',
];

export default function AuditLogFilters({ filters, onChange }: AuditLogFiltersProps) {
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
          <select value={filters.action || ''} onChange={(e) => update('action', e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Actions</option>
            {actionTypes.filter(Boolean).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
          <select value={filters.entityType || ''} onChange={(e) => update('entityType', e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Entities</option>
            {entityTypes.filter(Boolean).map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
          <input type="text" value={filters.userId || ''} onChange={(e) => update('userId', e.target.value)}
            placeholder="Filter by user"
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={filters.from || ''} onChange={(e) => update('from', e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={filters.to || ''} onChange={(e) => update('to', e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
}
