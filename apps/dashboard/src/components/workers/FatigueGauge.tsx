interface FatigueGaugeProps {
  score: number;
  maxEntries: number;
  currentEntries: number;
  undergroundMinutes: number;
  maxMinutes: number;
}

export default function FatigueGauge({ score, maxEntries, currentEntries, undergroundMinutes, maxMinutes }: FatigueGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const color = clampedScore >= 80 ? '#ef4444' : clampedScore >= 50 ? '#eab308' : '#22c55e';
  const bgTrack = clampedScore >= 80 ? '#fecaca' : clampedScore >= 50 ? '#fef9c3' : '#dcfce7';

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke={bgTrack} strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{clampedScore}</span>
          <span className="text-xs text-gray-500">Fatigue</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-center">
        <div>
          <p className="text-gray-500 text-xs">Entries</p>
          <p className="font-semibold">{currentEntries} / {maxEntries}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Underground</p>
          <p className="font-semibold">{undergroundMinutes} / {maxMinutes} min</p>
        </div>
      </div>
    </div>
  );
}
