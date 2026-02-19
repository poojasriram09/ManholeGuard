interface MaintenanceItem {
  id: string;
  manholeId?: string;
  type?: string;
  scheduledAt: string;
  assignedTeam?: string;
  status?: string;
  notes?: string;
}

interface ScheduleCalendarProps {
  items: MaintenanceItem[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit',
  });
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

export default function ScheduleCalendar({ items }: ScheduleCalendarProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No scheduled maintenance items.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y">
      {sorted.map((item) => (
        <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
          <div className="text-center min-w-[60px]">
            <p className="text-xs text-gray-500">{formatDate(item.scheduledAt)}</p>
            <p className="text-sm font-semibold">{formatTime(item.scheduledAt)}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {item.type || 'Maintenance'} {item.manholeId ? `- ${item.manholeId}` : ''}
            </p>
            {item.assignedTeam && (
              <p className="text-xs text-gray-500">Team: {item.assignedTeam}</p>
            )}
            {item.notes && <p className="text-xs text-gray-400 truncate">{item.notes}</p>}
          </div>
          {item.status && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
              {item.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
