import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<{ data: any[] }>('/alerts/recent'),
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading...</div>;
  const alerts = data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Recent Alerts</h1>
      <div className="space-y-3">
        {alerts.map((alert: any) => (
          <div key={alert.id} className={`card-surface p-4 border-l-4 ${
            alert.alertType === 'SOS' ? 'border-danger' :
            alert.alertType === 'GAS' ? 'border-caution' :
            'border-caution'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-sm text-text-primary">{alert.alertType}</span>
                <p className="text-sm text-text-muted mt-1">Sent to: {alert.sentTo}</p>
              </div>
              <div className="text-right text-sm text-text-muted">
                {new Date(alert.sentAt).toLocaleString()}
                {alert.acknowledged && <span className="ml-2 text-safe">Acknowledged</span>}
              </div>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-center text-text-muted py-10">No recent alerts</p>}
      </div>
    </div>
  );
}
