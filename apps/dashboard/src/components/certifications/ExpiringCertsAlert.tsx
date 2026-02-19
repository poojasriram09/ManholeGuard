interface ExpiringCertsAlertProps {
  count: number;
  onClick?: () => void;
}

export default function ExpiringCertsAlert({ count, onClick }: ExpiringCertsAlertProps) {
  if (count === 0) return null;

  return (
    <div
      onClick={onClick}
      className={`bg-caution-muted/30 border border-caution/20 rounded-lg px-4 py-3 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:bg-caution-muted/50' : ''} transition-colors`}
    >
      <svg className="w-5 h-5 text-caution flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div>
        <p className="text-sm font-heading font-semibold text-caution">
          {count} certification{count !== 1 ? 's' : ''} expiring soon
        </p>
        <p className="text-xs text-text-secondary">
          Worker certifications expiring within the next 30 days require renewal.
        </p>
      </div>
    </div>
  );
}
