import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AreaSafetyData {
  area: string;
  safetyScore: number;
  incidents: number;
}

interface AreaSafetyTrendChartProps {
  data: AreaSafetyData[];
}

export default function AreaSafetyTrendChart({ data }: AreaSafetyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No area safety data available.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-heading font-semibold text-text-primary mb-4">Area Safety Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="area" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
          <Bar dataKey="safetyScore" fill="var(--chart-1)" name="Safety Score" radius={[4, 4, 0, 0]} />
          <Bar dataKey="incidents" fill="var(--chart-4)" name="Incidents" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
