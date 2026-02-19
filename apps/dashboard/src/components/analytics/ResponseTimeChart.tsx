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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No response time data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Alert Response Time Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis unit="s" />
          <Tooltip formatter={(val: number) => [`${val}s`, 'Avg Response']} />
          <Line
            type="monotone"
            dataKey="avgSeconds"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
