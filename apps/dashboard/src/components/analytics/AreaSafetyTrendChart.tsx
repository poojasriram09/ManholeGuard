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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No area safety data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Area Safety Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="safetyScore" fill="#3b82f6" name="Safety Score" />
          <Bar dataKey="incidents" fill="#ef4444" name="Incidents" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
