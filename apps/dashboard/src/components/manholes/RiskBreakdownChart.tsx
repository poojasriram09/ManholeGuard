import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskBreakdownChartProps {
  factors: {
    blockageFrequency: number;
    incidentCount: number;
    rainfallFactor: number;
    areaRisk: number;
    gasFactor: number;
    weatherFactor: number;
  };
}

const weights: Record<string, { label: string; weight: number; color: string }> = {
  blockageFrequency: { label: 'Blockage', weight: 0.25, color: '#a78bfa' },
  incidentCount: { label: 'Incidents', weight: 0.20, color: '#f43f5e' },
  rainfallFactor: { label: 'Rainfall', weight: 0.15, color: '#3b82f6' },
  areaRisk: { label: 'Area Risk', weight: 0.10, color: '#fbbf24' },
  gasFactor: { label: 'Gas', weight: 0.20, color: '#f43f5e' },
  weatherFactor: { label: 'Weather', weight: 0.10, color: '#22d3ee' },
};

export default function RiskBreakdownChart({ factors }: RiskBreakdownChartProps) {
  const data = Object.entries(weights).map(([key, meta]) => ({
    name: meta.label,
    raw: factors[key as keyof typeof factors] ?? 0,
    weighted: Number(((factors[key as keyof typeof factors] ?? 0) * meta.weight).toFixed(2)),
    weight: `${(meta.weight * 100).toFixed(0)}%`,
  }));

  const totalScore = data.reduce((sum, d) => sum + d.weighted, 0);

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-heading font-semibold text-text-primary">Risk Breakdown</h3>
        <span className="text-sm font-heading font-bold text-text-primary">Total: {totalScore.toFixed(1)}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
          <Tooltip
            formatter={(value: number, _name: string, props: any) =>
              [`${value} (raw: ${props.payload.raw}, weight: ${props.payload.weight})`, 'Score']
            }
            contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
          />
          <Bar dataKey="weighted" fill="var(--chart-5)" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
