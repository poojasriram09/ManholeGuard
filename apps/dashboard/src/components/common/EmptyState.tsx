interface EmptyStateProps {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <svg className="w-16 h-16 mx-auto text-text-muted/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-heading font-medium text-text-secondary">{title}</h3>
      {message && <p className="text-sm text-text-muted mt-1">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
