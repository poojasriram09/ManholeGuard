import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import StatCard from '../components/common/StatCard';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<{ data: any }>('/dashboard/stats'),
    refetchInterval: 30000,
  });

  const stats = data?.data;

  if (isLoading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Active Entries" value={stats?.activeEntries ?? 0} color="blue" />
        <StatCard title="Total Manholes" value={stats?.totalManholes ?? 0} color="green" />
        <StatCard title="Total Workers" value={stats?.totalWorkers ?? 0} color="blue" />
        <StatCard title="Incidents (24h)" value={stats?.recentIncidents ?? 0} color="yellow" />
        <StatCard title="Active SOS" value={stats?.activeAlerts ?? 0} color="red" />
      </div>
    </div>
  );
}
