interface TimelineEvent {
  time: string;
  type: string;
  description: string;
}

interface EntryTimelineProps {
  events: TimelineEvent[];
}

const typeColors: Record<string, string> = {
  scan: 'bg-accent',
  checklist: 'bg-[#a78bfa]',
  entry: 'bg-safe',
  checkin: 'bg-live',
  exit: 'bg-text-muted',
  alert: 'bg-danger',
  sos: 'bg-danger',
};

export default function EntryTimeline({ events }: EntryTimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-text-muted text-center py-4">No events recorded</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-border" />
      <ul className="space-y-4">
        {events.map((event, i) => (
          <li key={i} className="relative flex items-start gap-3">
            <span
              className={`absolute -left-3.5 mt-1.5 w-3 h-3 rounded-full border-2 border-surface-card ${typeColors[event.type] ?? 'bg-text-muted'}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{event.description}</p>
              <p className="text-xs text-text-muted">{new Date(event.time).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
