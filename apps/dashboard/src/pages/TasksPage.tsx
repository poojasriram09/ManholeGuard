import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get<{ data: any[] }>('/tasks'),
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  const tasks = data?.data ?? [];

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((t: any) => (
              <tr key={t.id}>
                <td className="px-6 py-4 text-sm capitalize">{t.taskType}</td>
                <td className="px-6 py-4 text-sm capitalize">{t.priority}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status] || ''}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4 text-sm">{t.supervisor?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
