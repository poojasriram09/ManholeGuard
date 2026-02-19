import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api/client';
import StatCard from '../components/common/StatCard';

const RISK_COLORS = ['#34d399', '#fbbf24', '#f43f5e'];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get<{ data: any }>('/analytics/overview'),
  });

  if (isLoading) return <div className="text-center py-10 text-text-muted">Loading analytics...</div>;
  const stats = data?.data;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Entries" value={stats?.totalEntries ?? 0} color="blue" />
        <StatCard title="Active Now" value={stats?.activeEntries ?? 0} color="green" />
        <StatCard title="Incidents" value={stats?.totalIncidents ?? 0} color="yellow" />
        <StatCard title="Alerts Sent" value={stats?.totalAlerts ?? 0} color="red" />
      </div>

      {stats?.riskDistribution && (
        <div className="card-surface p-6 mb-8">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Risk Distribution</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.riskDistribution} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.riskDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
