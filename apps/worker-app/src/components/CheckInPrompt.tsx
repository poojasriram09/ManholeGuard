import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface CheckInPromptProps {
  checkInId: string;
  onRespond: (method: string) => void;
  countdown: number;
  onDismiss: () => void;
}

const AUDIO_FREQUENCIES = [800, 1000, 800, 1000]; // Alternating tones
const TONE_DURATION_MS = 200;
const TONE_PAUSE_MS = 150;

export default function CheckInPrompt({
  checkInId,
  onRespond,
  countdown,
  onDismiss,
}: CheckInPromptProps) {
  const { t } = useTranslation();
  const [responding, setResponding] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mountedRef = useRef(true);

  // Play alert tone on mount using Web Audio API
  useEffect(() => {
    mountedRef.current = true;

    const playAlertTone = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        for (let i = 0; i < AUDIO_FREQUENCIES.length; i++) {
          if (!mountedRef.current) break;

          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(AUDIO_FREQUENCIES[i], ctx.currentTime);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

          oscillator.start();
          await new Promise((resolve) => setTimeout(resolve, TONE_DURATION_MS));
          oscillator.stop();
          await new Promise((resolve) => setTimeout(resolve, TONE_PAUSE_MS));
        }
      } catch {
        // Web Audio API not available; silently fail
      }
    };

    playAlertTone();

    // Vibrate on mount
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 600]);
    }

    return () => {
      mountedRef.current = false;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [checkInId]);

  // Vibrate more urgently as countdown gets low
  useEffect(() => {
    if (countdown <= 15 && countdown > 0 && countdown % 5 === 0) {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [countdown]);

  const handleRespond = useCallback(async () => {
    if (responding) return;
    setResponding(true);

    // Haptic confirmation
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    onRespond('tap');
  }, [responding, onRespond]);

  // Determine urgency colors based on countdown
  const isUrgent = countdown <= 15;
  const isCritical = countdown <= 5;

  const ringColor = isCritical
    ? 'text-red-500'
    : isUrgent
      ? 'text-yellow-400'
      : 'text-green-400';

  const bgPulse = isCritical
    ? 'animate-pulse bg-red-950'
    : isUrgent
      ? 'bg-gray-950'
      : 'bg-gray-950';

  // Progress for countdown ring
  const totalSeconds = 60;
  const fraction = countdown / totalSeconds;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${bgPulse}`}
      role="alertdialog"
      aria-modal="true"
      aria-label={t('checkin.prompt')}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">{t('checkin.prompt')}</h2>
        <button
          type="button"
          onClick={onDismiss}
          className="p-2 text-gray-400 hover:text-white"
          aria-label={t('common.close')}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Countdown display */}
      <div className="mb-6 text-center">
        <span className={`text-5xl font-mono font-bold ${ringColor}`}>
          {countdown}
        </span>
        <span className="block text-gray-400 text-sm mt-1">
          seconds remaining
        </span>
      </div>

      {/* Central "I'm OK" button with countdown ring */}
      <div className="relative flex items-center justify-center">
        {/* Countdown ring */}
        <svg
          className="absolute -rotate-90"
          width="260"
          height="260"
          viewBox="0 0 260 260"
        >
          {/* Background ring */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${ringColor} transition-all duration-1000 ease-linear`}
          />
        </svg>

        {/* Tap button */}
        <button
          type="button"
          onClick={handleRespond}
          disabled={responding || countdown <= 0}
          className={`
            relative z-10 flex flex-col items-center justify-center
            rounded-full shadow-2xl select-none touch-none
            transition-all duration-150 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${responding
              ? 'bg-green-700 w-[230px] h-[230px]'
              : 'bg-green-600 hover:bg-green-500 active:bg-green-700 w-[230px] h-[230px]'
            }
          `}
          style={{ width: 250, height: 250 }}
          aria-label={t('checkin.respond')}
        >
          {responding ? (
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white text-xl font-bold mt-2">
                {t('common.success')}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 text-white mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white text-2xl font-extrabold">
                {t('checkin.respond')}
              </span>
              <span className="text-green-200 text-sm mt-1">
                {t('checkin.tapToConfirm')}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Countdown expired message */}
      {countdown <= 0 && !responding && (
        <div className="mt-8 px-6 py-4 bg-red-900 rounded-xl text-center max-w-xs">
          <p className="text-red-200 font-bold text-lg">
            {t('checkin.missed')}
          </p>
          <p className="text-red-300 text-sm mt-1">
            Supervisor has been notified
          </p>
        </div>
      )}
    </div>
  );
}
