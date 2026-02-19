import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponseTimeData {
  date: string;
  avgSeconds: number;
}

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
}

export default function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No response time data available.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-heading font-semibold text-text-primary mb-4">Alert Response Time Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <YAxis unit="s" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <Tooltip
            formatter={(val: number) => [`${val}s`, 'Avg Response']}
            contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
          />
          <Line
            type="monotone"
            dataKey="avgSeconds"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--chart-3)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
