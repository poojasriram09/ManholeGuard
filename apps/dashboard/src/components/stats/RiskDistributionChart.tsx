import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RiskDistributionChartProps {
  data: Array<{ level: string; count: number }>;
}

const LEVEL_COLORS: Record<string, string> = {
  SAFE: '#34d399',
  CAUTION: '#fbbf24',
  PROHIBITED: '#f43f5e',
};

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        No risk data available
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="text-sm font-heading font-semibold text-text-primary mb-3">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="level"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            label={({ level, count }) => `${level}: ${count}`}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={LEVEL_COLORS[entry.level] ?? '#64748b'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} manholes`, 'Count']}
            contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
