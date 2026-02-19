interface OverdueItem {
  id: string;
  manholeId?: string;
  type?: string;
  scheduledAt: string;
  assignedTeam?: string;
  notes?: string;
}

interface OverdueMaintenanceListProps {
  items: OverdueItem[];
}

function daysOverdue(scheduledAt: string): number {
  const diff = Date.now() - new Date(scheduledAt).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function OverdueMaintenanceList({ items }: OverdueMaintenanceListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No overdue maintenance items.
      </div>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b bg-red-50">
        <h3 className="text-sm font-semibold text-red-800">
          Overdue Maintenance ({items.length})
        </h3>
      </div>
      <ul className="divide-y">
        {sorted.map((item) => {
          const days = daysOverdue(item.scheduledAt);
          return (
            <li key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-red-50/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold text-red-700">{days}d</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.type || 'Maintenance'} {item.manholeId ? `- ${item.manholeId}` : ''}
                </p>
                <p className="text-xs text-gray-500">
                  Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}
                  {item.assignedTeam && ` | Team: ${item.assignedTeam}`}
                </p>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                OVERDUE
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
