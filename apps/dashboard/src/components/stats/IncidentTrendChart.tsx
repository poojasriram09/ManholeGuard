import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface IncidentTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No incident data available
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Incident Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number) => [`${value}`, 'Incidents']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3, fill: '#ef4444' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
