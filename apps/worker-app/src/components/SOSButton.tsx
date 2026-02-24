import { useState, useRef, useCallback, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { offlineStore } from '../db/offline-store';

const SOS_HOLD_DURATION_MS = 3000;
const SOS_VIBRATION_PATTERN = [500, 200, 500, 200, 500];

export default function SOSButton() {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [sending, setSending] = useState(false);

  const holdStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSOS = useCallback(async () => {
    setTriggered(true);
    setSending(true);

    // Sustained vibration to confirm activation
    if (navigator.vibrate) {
      navigator.vibrate(SOS_VIBRATION_PATTERN);
    }

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000,
        });
      });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // Fall back to cached GPS
      const cached = offlineStore.getLastGPS();
      if (cached) {
        latitude = cached.latitude;
        longitude = cached.longitude;
      }
    }

    const profile = offlineStore.getWorkerProfile();
    const workerId = (profile?.id as string) || localStorage.getItem('worker-id') || 'unknown';

    try {
      await apiRequest('/sos/trigger', {
        method: 'POST',
        body: JSON.stringify({
          workerId,
          latitude,
          longitude,
          method: 'hold_button',
        }),
      });
    } catch {
      // Offline -- queue SOS for sync (highest priority)
      await offlineStore.savePendingSOS({
        workerId,
        latitude,
        longitude,
        method: 'hold_button',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  }, []);

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - holdStartRef.current;
    const pct = Math.min((elapsed / SOS_HOLD_DURATION_MS) * 100, 100);
    setProgress(pct);

    if (pct < 100) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const startHold = useCallback(() => {
    if (triggered) return;

    setHolding(true);
    setProgress(0);
    holdStartRef.current = Date.now();

    // Haptic feedback on press start
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = setTimeout(() => {
      setHolding(false);
      setProgress(100);
      triggerSOS();
    }, SOS_HOLD_DURATION_MS);
  }, [triggered, updateProgress, triggerSOS]);

  const cancelHold = useCallback(() => {
    if (triggered) return;

    setHolding(false);
    setProgress(0);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  }, [triggered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // SVG progress ring calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (triggered) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-danger animate-ping opacity-50" />
          <div className="relative flex flex-col items-center justify-center w-20 h-20 rounded-full bg-danger shadow-glow-danger">
            {sending ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="text-white text-xs font-bold mt-0.5">
              {sending ? 'SENDING' : 'SENT'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        className="relative flex items-center justify-center w-20 h-20 rounded-full bg-danger shadow-glow-danger active:bg-danger select-none touch-none"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="SOS Emergency - Hold for 3 seconds to activate"
      >
        {/* Progress ring overlay */}
        {holding && (
          <svg
            className="absolute inset-0 w-20 h-20 -rotate-90"
            viewBox="0 0 80 80"
          >
            {/* Background track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
            />
            {/* Progress arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
        )}

        {/* Button content */}
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-white text-xs font-extrabold tracking-wide">SOS</span>
        </div>

        {/* Pulse ring when not holding */}
        {!holding && (
          <span className="absolute inset-0 rounded-full border-2 border-danger animate-ping opacity-30" />
        )}
      </button>
    </div>
  );
}
