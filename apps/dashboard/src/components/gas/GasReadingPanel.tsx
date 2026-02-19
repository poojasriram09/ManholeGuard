interface GasReading {
  gasType: string;
  value: number;
  unit: string;
  timestamp?: string;
}

interface GasReadingPanelProps {
  readings: GasReading[];
  manholeId?: string;
}

const thresholds: Record<string, { safe: number; danger: number; unit: string }> = {
  H2S: { safe: 10, danger: 20, unit: 'ppm' },
  CH4: { safe: 10, danger: 20, unit: '% LEL' },
  CO: { safe: 25, danger: 50, unit: 'ppm' },
  O2: { safe: 19.5, danger: 16, unit: '%' },
  CO2: { safe: 5000, danger: 30000, unit: 'ppm' },
  NH3: { safe: 25, danger: 50, unit: 'ppm' },
};

function getColor(gasType: string, value: number): string {
  const t = thresholds[gasType];
  if (!t) return 'text-gray-700';
  if (gasType === 'O2') {
    return value >= t.safe ? 'text-green-600' : value >= t.danger ? 'text-yellow-600' : 'text-red-600';
  }
  return value <= t.safe ? 'text-green-600' : value <= t.danger ? 'text-yellow-600' : 'text-red-600';
}

export default function GasReadingPanel({ readings, manholeId }: GasReadingPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Gas Readings</h3>
        {manholeId && <span className="text-xs text-gray-500">Manhole: {manholeId}</span>}
      </div>
      {readings.length === 0 ? (
        <p className="text-sm text-gray-400">No gas readings available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {readings.map((r) => (
            <div key={r.gasType} className="border rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium">{r.gasType}</p>
              <p className={`text-xl font-bold ${getColor(r.gasType, r.value)}`}>{r.value}</p>
              <p className="text-xs text-gray-400">{r.unit || thresholds[r.gasType]?.unit || ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
