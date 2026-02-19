interface RiskBadgeProps {
  level: 'SAFE' | 'CAUTION' | 'PROHIBITED';
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const styles = {
    SAFE: 'bg-safe-muted text-safe border border-safe/20',
    CAUTION: 'bg-caution-muted text-caution border border-caution/20',
    PROHIBITED: 'bg-danger-muted text-danger border border-danger/20 animate-pulse-glow',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}
