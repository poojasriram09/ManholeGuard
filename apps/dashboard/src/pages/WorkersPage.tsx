import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function WorkersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get<{ data: any[] }>('/workers'),
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  const workers = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Workers ({workers.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workers.map((w: any) => (
              <tr key={w.id}>
                <td className="px-6 py-4 text-sm font-mono">{w.employeeId}</td>
                <td className="px-6 py-4 text-sm font-medium">{w.name}</td>
                <td className="px-6 py-4 text-sm">{w.phone}</td>
                <td className="px-6 py-4 text-sm">{w.supervisor?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${w.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {w.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
