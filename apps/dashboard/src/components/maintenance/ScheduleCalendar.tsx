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
  SCHEDULED: 'bg-accent-muted text-accent border border-accent/20',
  IN_PROGRESS: 'bg-caution-muted text-caution border border-caution/20',
  COMPLETED: 'bg-safe-muted text-safe border border-safe/20',
  OVERDUE: 'bg-danger-muted text-danger border border-danger/20',
};

export default function ScheduleCalendar({ items }: ScheduleCalendarProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No scheduled maintenance items.
      </div>
    );
  }

  return (
    <div className="card-surface divide-y divide-border">
      {sorted.map((item) => (
        <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors">
          <div className="text-center min-w-[60px]">
            <p className="text-xs text-text-muted">{formatDate(item.scheduledAt)}</p>
            <p className="text-sm font-semibold text-text-primary">{formatTime(item.scheduledAt)}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {item.type || 'Maintenance'} {item.manholeId ? `- ${item.manholeId}` : ''}
            </p>
            {item.assignedTeam && (
              <p className="text-xs text-text-secondary">Team: {item.assignedTeam}</p>
            )}
            {item.notes && <p className="text-xs text-text-muted truncate">{item.notes}</p>}
          </div>
          {item.status && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status] || 'bg-surface-elevated text-text-secondary'}`}>
              {item.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
