import StatCard from '../common/StatCard';

interface StatsOverviewProps {
  stats: any;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null;

  const cards = [
    { title: 'Active Entries', value: stats.activeEntries ?? 0, color: 'blue', subtitle: 'Currently underground' },
    { title: 'Total Workers', value: stats.totalWorkers ?? 0, color: 'green', subtitle: stats.onDutyWorkers != null ? `${stats.onDutyWorkers} on duty` : undefined },
    { title: 'Alerts Today', value: stats.alertsToday ?? 0, color: 'yellow', subtitle: stats.unresolvedAlerts != null ? `${stats.unresolvedAlerts} unresolved` : undefined },
    { title: 'SOS Events', value: stats.sosEvents ?? 0, color: 'red', subtitle: 'Last 24 hours' },
    { title: 'Total Manholes', value: stats.totalManholes ?? 0, color: 'blue', subtitle: stats.prohibitedManholes != null ? `${stats.prohibitedManholes} prohibited` : undefined },
    { title: 'Avg Risk Score', value: stats.avgRiskScore != null ? stats.avgRiskScore.toFixed(1) : '---', color: 'yellow', subtitle: 'Across all manholes' },
    { title: 'Entries Today', value: stats.entriesToday ?? 0, color: 'green', subtitle: stats.completedToday != null ? `${stats.completedToday} completed` : undefined },
    { title: 'Incidents (30d)', value: stats.incidentsMonth ?? 0, color: 'red', subtitle: 'Last 30 days' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} title={card.title} value={card.value} color={card.color} subtitle={card.subtitle} />
      ))}
    </div>
  );
}
