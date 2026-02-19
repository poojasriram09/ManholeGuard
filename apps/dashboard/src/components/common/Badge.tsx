interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-surface-elevated text-text-secondary border border-border',
  success: 'bg-safe-muted text-safe border border-safe/20',
  warning: 'bg-caution-muted text-caution border border-caution/20',
  danger: 'bg-danger-muted text-danger border border-danger/20',
  info: 'bg-accent-muted text-accent-strong border border-accent/20',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
