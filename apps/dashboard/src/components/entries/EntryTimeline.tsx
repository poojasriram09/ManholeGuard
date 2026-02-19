interface TimelineEvent {
  time: string;
  type: string;
  description: string;
}

interface EntryTimelineProps {
  events: TimelineEvent[];
}

const typeColors: Record<string, string> = {
  scan: 'bg-blue-500',
  checklist: 'bg-indigo-500',
  entry: 'bg-green-500',
  checkin: 'bg-teal-500',
  exit: 'bg-gray-500',
  alert: 'bg-red-500',
  sos: 'bg-red-700',
};

export default function EntryTimeline({ events }: EntryTimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No events recorded</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gray-200" />
      <ul className="space-y-4">
        {events.map((event, i) => (
          <li key={i} className="relative flex items-start gap-3">
            <span
              className={`absolute -left-3.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${typeColors[event.type] ?? 'bg-gray-400'}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.description}</p>
              <p className="text-xs text-gray-500">{new Date(event.time).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
