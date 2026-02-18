import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function IncidentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get<{ data: any[] }>('/incidents'),
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  const incidents = data?.data ?? [];

  const severityColors: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Incidents</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.map((inc: any) => (
              <tr key={inc.id}>
                <td className="px-6 py-4 text-sm">{inc.incidentType}</td>
                <td className="px-6 py-4 text-sm">{inc.manhole?.area}</td>
                <td className="px-6 py-4 text-sm">{inc.worker?.name || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[inc.severity]}`}>{inc.severity}</span>
                </td>
                <td className="px-6 py-4 text-sm">{inc.resolved ? 'Resolved' : 'Open'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(inc.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
