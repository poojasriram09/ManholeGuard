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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No worker performance data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Worker Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="totalEntries" fill="#3b82f6" name="Entries" />
          <Bar yAxisId="right" dataKey="checklistCompliance" fill="#22c55e" name="Compliance %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
