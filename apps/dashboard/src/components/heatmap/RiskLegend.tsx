const levels = [
  { label: 'SAFE', color: 'bg-safe', range: '0 - 29' },
  { label: 'CAUTION', color: 'bg-caution', range: '30 - 59' },
  { label: 'PROHIBITED', color: 'bg-danger', range: '60 - 100' },
];

export default function RiskLegend() {
  return (
    <div className="card-surface p-3 text-sm">
      <p className="font-heading font-semibold text-text-primary mb-2">Risk Levels</p>
      <ul className="space-y-1.5">
        {levels.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="font-medium text-text-primary">{l.label}</span>
            <span className="text-text-muted text-xs ml-auto">{l.range}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
