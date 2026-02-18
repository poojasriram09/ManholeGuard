import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<{ data: any[] }>('/alerts/recent'),
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  const alerts = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recent Alerts</h1>
      <div className="space-y-3">
        {alerts.map((alert: any) => (
          <div key={alert.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            alert.alertType === 'SOS' ? 'border-red-500' :
            alert.alertType === 'GAS' ? 'border-orange-500' :
            'border-yellow-500'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-sm">{alert.alertType}</span>
                <p className="text-sm text-gray-500 mt-1">Sent to: {alert.sentTo}</p>
              </div>
              <div className="text-right text-sm text-gray-400">
                {new Date(alert.sentAt).toLocaleString()}
                {alert.acknowledged && <span className="ml-2 text-green-600">Acknowledged</span>}
              </div>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-center text-gray-400 py-10">No recent alerts</p>}
      </div>
    </div>
  );
}
