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

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;

  const expiringCount = expiring?.data?.length ?? 0;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Worker Certifications</h1>

      {expiringCount > 0 && (
        <div className="bg-caution-muted border-l-4 border-caution p-4 mb-6 rounded-lg">
          <p className="text-caution font-medium">{expiringCount} certification(s) expiring within 30 days</p>
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Certifications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(workers?.data ?? []).map((w: any) => {
              const certs = w.certifications || [];
              const validCount = certs.filter((c: any) => c.isValid).length;
              const expiredCount = certs.filter((c: any) => !c.isValid).length;
              return (
                <tr key={w.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{w.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-text-secondary">{w.employeeId}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-safe">{validCount} valid</span>
                    {expiredCount > 0 && <span className="text-danger ml-2">{expiredCount} expired</span>}
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
