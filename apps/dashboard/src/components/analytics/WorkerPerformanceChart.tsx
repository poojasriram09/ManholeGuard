import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WorkerPerformanceData {
  name: string;
  totalEntries: number;
  checklistCompliance: number;
}

interface WorkerPerformanceChartProps {
  data: WorkerPerformanceData[];
}

export default function WorkerPerformanceChart({ data }: WorkerPerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No worker performance data available.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-heading font-semibold text-text-primary mb-4">Worker Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
          <Bar yAxisId="left" dataKey="totalEntries" fill="var(--chart-1)" name="Entries" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="checklistCompliance" fill="var(--chart-2)" name="Compliance %" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
