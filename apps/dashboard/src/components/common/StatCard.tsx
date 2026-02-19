interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({ title, value, subtitle, color = 'blue' }: StatCardProps) {
  const colorConfig: Record<string, { border: string; glow: string; text: string }> = {
    blue: { border: 'border-accent', glow: 'shadow-glow-accent', text: 'text-accent-strong' },
    green: { border: 'border-safe', glow: 'shadow-glow-safe', text: 'text-safe' },
    yellow: { border: 'border-caution', glow: 'shadow-glow-caution', text: 'text-caution' },
    red: { border: 'border-danger', glow: 'shadow-glow-danger', text: 'text-danger' },
  };

  const cfg = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`card-surface border-l-4 ${cfg.border} p-4 transition-all duration-200 hover:${cfg.glow} hover:shadow-card-hover`}>
      <p className="text-sm text-text-muted">{title}</p>
      <p className={`font-heading text-3xl font-bold mt-1 ${cfg.text}`}>{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}
