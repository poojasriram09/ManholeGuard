import { useState, useEffect, useRef, useCallback } from 'react';

interface EntryTimerProps {
  entryTime: string;
  allowedMinutes: number;
  onOverstay?: () => void;
}

export default function EntryTimer({ entryTime, allowedMinutes, onOverstay }: EntryTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const entryMs = new Date(entryTime).getTime();
    const allowedMs = allowedMinutes * 60 * 1000;
    const deadline = entryMs + allowedMs;
    return Math.max(0, Math.round((deadline - Date.now()) / 1000));
  });

  const overstayFiredRef = useRef(false);
  const warningFiredRef = useRef(false);
  const onOverstayRef = useRef(onOverstay);

  useEffect(() => {
    onOverstayRef.current = onOverstay;
  }, [onOverstay]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  useEffect(() => {
    const entryMs = new Date(entryTime).getTime();
    const allowedMs = allowedMinutes * 60 * 1000;
    const deadline = entryMs + allowedMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.round((deadline - now) / 1000);

      if (remaining <= 0) {
        setRemainingSeconds(0);

        if (!overstayFiredRef.current) {
          overstayFiredRef.current = true;
          vibrate([500, 200, 500, 200, 500]);
          onOverstayRef.current?.();
        }
      } else {
        setRemainingSeconds(remaining);

        // Vibrate warning at 5 minutes remaining
        if (remaining <= 300 && remaining > 298 && !warningFiredRef.current) {
          warningFiredRef.current = true;
          vibrate([300, 100, 300, 100, 300]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [entryTime, allowedMinutes, vibrate]);

  const totalSeconds = allowedMinutes * 60;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  const displayMinutes = Math.floor(Math.abs(remainingSeconds) / 60);
  const displaySeconds = Math.abs(remainingSeconds) % 60;
  const isOvertime = remainingSeconds <= 0;
  const isWarning = remainingSeconds > 0 && remainingSeconds <= 300;

  const progressColor =
    isOvertime ? 'bg-red-500' :
    progress > 80 ? 'bg-red-500' :
    progress > 60 ? 'bg-yellow-500' :
    'bg-green-500';

  const textColor =
    isOvertime ? 'text-red-600' :
    isWarning ? 'text-yellow-600' :
    'text-gray-900';

  const bgPulse = isOvertime ? 'animate-pulse bg-red-50' : '';

  return (
    <div className={`rounded-2xl p-6 border-2 ${
      isOvertime ? 'border-red-300 bg-red-50' :
      isWarning ? 'border-yellow-300 bg-yellow-50' :
      'border-gray-200 bg-white'
    } ${bgPulse}`}>
      {/* Timer Label */}
      <div className="text-center mb-2">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {isOvertime ? 'Overtime' : 'Time Remaining'}
        </span>
      </div>

      {/* Large Countdown Display */}
      <div className="text-center mb-4">
        <span className={`text-7xl font-mono font-bold tabular-nums ${textColor}`}>
          {isOvertime && '-'}
          {String(displayMinutes).padStart(2, '0')}
          <span className={isOvertime ? 'text-red-400' : 'text-gray-400'}>:</span>
          {String(displaySeconds).padStart(2, '0')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-1000 ease-linear ${progressColor}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Footer Info */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0 min</span>
        <span>Allowed: {allowedMinutes} min</span>
      </div>

      {/* Warning Message */}
      {isWarning && (
        <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-xl p-3 text-center">
          <p className="text-yellow-800 text-sm font-semibold">
            Less than 5 minutes remaining. Prepare to exit.
          </p>
        </div>
      )}

      {isOvertime && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-xl p-3 text-center">
          <p className="text-red-800 text-sm font-bold">
            Time exceeded! Exit immediately.
          </p>
        </div>
      )}
    </div>
  );
}
