import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

export default function HistoryPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<{ data: any[] }>('/entry/worker/current').then((r) => setEntries(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-4 animate-fade-in-up">
      <h1 className="text-xl font-bold font-heading text-text-primary mb-4">Entry History</h1>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="card-surface p-4">
            <div className="flex justify-between">
              <span className="text-text-primary font-medium text-sm">{e.manhole?.area}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${e.status === 'EXITED' ? 'bg-safe-muted text-safe' : 'bg-caution-muted text-caution'}`}>
                {e.status}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{new Date(e.entryTime).toLocaleString()}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-text-muted py-10">No entries yet</p>}
      </div>
    </div>
  );
}
