import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function ActiveEntriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['active-entries'],
    queryFn: () => api.get<{ data: any[] }>('/entry/active'),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  const entries = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Active Entries ({entries.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry: any) => {
              const minutes = Math.round((Date.now() - new Date(entry.entryTime).getTime()) / 60000);
              const isOvertime = minutes > entry.allowedDurationMinutes;
              return (
                <tr key={entry.id} className={isOvertime ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium">{entry.worker?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{entry.manhole?.area} — {entry.manhole?.qrCodeId}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.entryTime).toLocaleTimeString()}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isOvertime ? 'text-red-600' : ''}`}>{minutes} min</td>
                  <td className="px-6 py-4 text-sm">{entry.state}</td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No active entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
