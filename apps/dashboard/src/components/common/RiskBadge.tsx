interface RiskBadgeProps {
  level: 'SAFE' | 'CAUTION' | 'PROHIBITED';
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const styles = {
    SAFE: 'bg-green-100 text-green-800',
    CAUTION: 'bg-yellow-100 text-yellow-800',
    PROHIBITED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}
