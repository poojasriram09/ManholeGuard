import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import RiskBadge from '../components/common/RiskBadge';

export default function ManholesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manholes'],
    queryFn: () => api.get<{ data: any[] }>('/manholes'),
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  const manholes = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manholes ({manholes.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gas Sensor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {manholes.map((m: any) => (
              <tr key={m.id}>
                <td className="px-6 py-4 text-sm font-mono">{m.qrCodeId}</td>
                <td className="px-6 py-4 text-sm">{m.area}</td>
                <td className="px-6 py-4"><RiskBadge level={m.riskLevel} /></td>
                <td className="px-6 py-4 text-sm">{m.riskScore}</td>
                <td className="px-6 py-4 text-sm">{m.hasGasSensor ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
