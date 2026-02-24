interface GeoFenceStatusProps {
  withinFence: boolean;
  distance: number;
  maxRadius: number;
}

export default function GeoFenceStatus({ withinFence, distance, maxRadius }: GeoFenceStatusProps) {
  const displayDistance = distance < 1
    ? `${(distance * 100).toFixed(0)} cm`
    : distance < 1000
      ? `${Math.round(distance)} m`
      : `${(distance / 1000).toFixed(1)} km`;

  const radiusUsage = Math.min(100, (distance / maxRadius) * 100);

  return (
    <div
      className={`rounded-2xl p-5 border-2 transition-colors ${
        withinFence
          ? 'border-safe/30 bg-safe-muted'
          : 'border-danger/30 bg-danger-muted'
      }`}
      role="status"
      aria-label={withinFence ? 'Within geofence' : 'Outside geofence'}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
          withinFence ? 'bg-safe' : 'bg-danger'
        }`}>
          {withinFence ? (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-lg font-bold ${withinFence ? 'text-safe' : 'text-danger'}`}>
            {withinFence ? 'Within Geofence' : 'Outside Geofence'}
          </p>
          <p className={`text-sm ${withinFence ? 'text-safe' : 'text-danger'}`}>
            Distance: <span className="font-mono font-semibold">{displayDistance}</span>
            {' '} / {maxRadius} m radius
          </p>
        </div>
      </div>

      {/* Distance Bar */}
      <div className="mt-4">
        <div className="w-full bg-surface-elevated rounded-full h-2.5 relative overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              withinFence ? 'bg-safe' : 'bg-danger'
            }`}
            style={{ width: `${Math.min(100, radiusUsage)}%` }}
          />
          {/* Threshold marker at 100% of radius */}
          <div
            className="absolute top-0 h-full w-0.5 bg-text-muted"
            style={{ left: '100%', transform: 'translateX(-1px)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>0 m</span>
          <span>{maxRadius} m</span>
        </div>
      </div>

      {!withinFence && (
        <div className="mt-3 bg-danger-muted border border-danger/20 rounded-xl p-3">
          <p className="text-danger text-sm font-semibold text-center">
            Move closer to the manhole to proceed. You are {Math.round(distance - maxRadius)} m outside the allowed zone.
          </p>
        </div>
      )}
    </div>
  );
}
