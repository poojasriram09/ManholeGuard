import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import Badge from '../components/common/Badge';

export default function CertificationsPage() {
  const { data: expiring } = useQuery({
    queryKey: ['certs-expiring'],
    queryFn: () => api.get<{ data: any[] }>('/certifications/expiring?days=30'),
  });

  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers-with-certs'],
    queryFn: () => api.get<{ data: any[] }>('/workers'),
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  const expiringCount = expiring?.data?.length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Worker Certifications</h1>

      {expiringCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <p className="text-yellow-800 font-medium">{expiringCount} certification(s) expiring within 30 days</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certifications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(workers?.data ?? []).map((w: any) => {
              const certs = w.certifications || [];
              const validCount = certs.filter((c: any) => c.isValid).length;
              const expiredCount = certs.filter((c: any) => !c.isValid).length;
              return (
                <tr key={w.id}>
                  <td className="px-6 py-4 text-sm font-medium">{w.name}</td>
                  <td className="px-6 py-4 text-sm font-mono">{w.employeeId}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-600">{validCount} valid</span>
                    {expiredCount > 0 && <span className="text-red-600 ml-2">{expiredCount} expired</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={expiredCount > 0 ? 'danger' : 'success'}>
                      {expiredCount > 0 ? 'Needs Renewal' : 'Compliant'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
