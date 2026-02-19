import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import RiskBadge from '../components/common/RiskBadge';

export default function ManholesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manholes'],
    queryFn: () => api.get<{ data: any[] }>('/manholes'),
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;
  const manholes = data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Manholes ({manholes.length})</h1>
      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">QR Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Gas Sensor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {manholes.map((m: any) => (
              <tr key={m.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-text-primary">{m.qrCodeId}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{m.area}</td>
                <td className="px-6 py-4"><RiskBadge level={m.riskLevel} /></td>
                <td className="px-6 py-4 text-sm text-text-secondary">{m.riskScore}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{m.hasGasSensor ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
