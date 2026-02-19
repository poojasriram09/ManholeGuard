interface EmptyStateProps {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <p className="text-gray-400 text-4xl mb-4">&#128196;</p>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          {action.label}
        </button>
      )}
    </div>
  );
}
