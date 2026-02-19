interface SOSAlertCardProps {
  sos: any;
  onResolve?: (id: string) => void;
}

export default function SOSAlertCard({ sos, onResolve }: SOSAlertCardProps) {
  const isResolved = sos.status === 'RESOLVED';

  return (
    <div className={`rounded-lg border-2 p-4 ${isResolved ? 'border-gray-300 bg-gray-50' : 'border-red-500 bg-red-50 animate-pulse'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚨</span>
            <h3 className={`text-lg font-bold ${isResolved ? 'text-gray-700' : 'text-red-700'}`}>
              SOS ALERT
            </h3>
            {isResolved && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Resolved</span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Worker:</span> <span className="font-medium">{sos.workerName ?? 'Unknown'}</span></p>
            <p><span className="text-gray-500">Location:</span> <span className="font-medium">{sos.location ?? 'Unknown'}</span></p>
            <p><span className="text-gray-500">Trigger:</span> <span className="font-medium">{sos.trigger ?? 'Manual'}</span></p>
            <p><span className="text-gray-500">Time:</span> <span className="font-medium">{sos.time ? new Date(sos.time).toLocaleString() : '---'}</span></p>
            {sos.message && <p className="text-gray-700 mt-1">{sos.message}</p>}
          </div>
        </div>
        {onResolve && !isResolved && (
          <button
            onClick={() => onResolve(sos.id)}
            className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
