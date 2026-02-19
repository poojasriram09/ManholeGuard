import StatCard from '../common/StatCard';

interface AnalyticsDashboardProps {
  stats: {
    totalEntries?: number;
    activeEntries?: number;
    avgRiskScore?: number;
    sosTriggered?: number;
    totalWorkers?: number;
    complianceRate?: number;
    avgResponseTime?: number;
    incidentsThisMonth?: number;
  };
  from?: string;
  to?: string;
}

export default function AnalyticsDashboard({ stats, from, to }: AnalyticsDashboardProps) {
  return (
    <div>
      {(from || to) && (
        <p className="text-sm text-text-muted mb-4">
          Period: {from || '---'} to {to || '---'}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Entries" value={stats.totalEntries ?? 0} color="blue" />
        <StatCard title="Active Entries" value={stats.activeEntries ?? 0} color="green" />
        <StatCard title="Avg Risk Score" value={stats.avgRiskScore?.toFixed(1) ?? '0'} color="yellow" />
        <StatCard title="SOS Triggered" value={stats.sosTriggered ?? 0} color="red" />
        <StatCard title="Total Workers" value={stats.totalWorkers ?? 0} color="blue" />
        <StatCard
          title="Compliance Rate"
          value={`${(stats.complianceRate ?? 0).toFixed(1)}%`}
          color="green"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime ?? 0}s`}
          color="yellow"
        />
        <StatCard title="Incidents (Month)" value={stats.incidentsThisMonth ?? 0} color="red" />
      </div>
    </div>
  );
}
