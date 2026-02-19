import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface IncidentTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        No incident data available
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="card-surface p-4">
      <h3 className="text-sm font-heading font-semibold text-text-primary mb-3">Incident Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--border-default)' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--border-default)' }} />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number) => [`${value}`, 'Incidents']}
            contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--danger)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--danger)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
