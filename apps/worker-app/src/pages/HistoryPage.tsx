import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

export default function HistoryPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<{ data: any[] }>('/entry/worker/current').then((r) => setEntries(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Entry History</h1>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="bg-white rounded-xl p-4 shadow">
            <div className="flex justify-between">
              <span className="font-medium text-sm">{e.manhole?.area}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${e.status === 'EXITED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {e.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{new Date(e.entryTime).toLocaleString()}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-gray-400 py-10">No entries yet</p>}
      </div>
    </div>
  );
}
