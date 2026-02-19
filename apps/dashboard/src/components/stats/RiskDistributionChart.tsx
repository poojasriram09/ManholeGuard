import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RiskDistributionChartProps {
  data: Array<{ level: string; count: number }>;
}

const LEVEL_COLORS: Record<string, string> = {
  SAFE: '#22c55e',
  CAUTION: '#eab308',
  PROHIBITED: '#ef4444',
};

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No risk data available
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Distribution</h3>
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
              <Cell key={i} fill={LEVEL_COLORS[entry.level] ?? '#9ca3af'} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} manholes`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
