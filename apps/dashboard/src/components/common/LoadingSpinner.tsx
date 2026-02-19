interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeValues = { sm: 20, md: 32, lg: 48 };

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const s = sizeValues[size];

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative" style={{ width: s, height: s }}>
        <svg className="animate-spin-slow" width={s} height={s} viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="20" stroke="var(--border-default)" strokeWidth="4" />
          <circle cx="25" cy="25" r="20" stroke="var(--accent)" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="80 50"
            style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }} />
        </svg>
      </div>
      {message && <p className="mt-3 text-sm text-text-muted">{message}</p>}
    </div>
  );
}
