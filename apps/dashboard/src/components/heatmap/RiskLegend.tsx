const levels = [
  { label: 'SAFE', color: 'bg-green-500', range: '0 - 29' },
  { label: 'CAUTION', color: 'bg-yellow-500', range: '30 - 59' },
  { label: 'PROHIBITED', color: 'bg-red-500', range: '60 - 100' },
];

export default function RiskLegend() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">Risk Levels</p>
      <ul className="space-y-1.5">
        {levels.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="font-medium text-gray-800">{l.label}</span>
            <span className="text-gray-500 text-xs ml-auto">{l.range}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
