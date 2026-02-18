import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api/client';
import StatCard from '../components/common/StatCard';

const RISK_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get<{ data: any }>('/analytics/overview'),
  });

  if (isLoading) return <div className="text-center py-10">Loading analytics...</div>;
  const stats = data?.data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Entries" value={stats?.totalEntries ?? 0} color="blue" />
        <StatCard title="Active Now" value={stats?.activeEntries ?? 0} color="green" />
        <StatCard title="Incidents" value={stats?.totalIncidents ?? 0} color="yellow" />
        <StatCard title="Alerts Sent" value={stats?.totalAlerts ?? 0} color="red" />
      </div>

      {stats?.riskDistribution && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.riskDistribution} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.riskDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
