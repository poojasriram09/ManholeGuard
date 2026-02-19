import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FATIGUE_LIMITS } from '@manholeguard/shared/src/constants/fatigue-limits';

interface ShiftData {
  entryCount: number;
  totalUndergroundMinutes: number;
  startTime: string;
}

interface FatigueBannerProps {
  shift: ShiftData | null;
}

type FatigueLevel = 'green' | 'yellow' | 'red';

interface FatigueMetric {
  label: string;
  current: number;
  max: number;
  unit: string;
  level: FatigueLevel;
  displayValue: string;
}

function getFatigueLevel(fraction: number): FatigueLevel {
  if (fraction >= 0.8) return 'red';
  if (fraction >= 0.5) return 'yellow';
  return 'green';
}

const LEVEL_COLORS: Record<FatigueLevel, { bar: string; text: string; bg: string }> = {
  green: { bar: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-900/20' },
  yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  red: { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-900/20' },
};

export default function FatigueBanner({ shift }: FatigueBannerProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const metrics = useMemo<FatigueMetric[]>(() => {
    if (!shift) return [];

    const entriesRemaining = FATIGUE_LIMITS.MAX_ENTRIES_PER_SHIFT - shift.entryCount;
    const entryFraction = shift.entryCount / FATIGUE_LIMITS.MAX_ENTRIES_PER_SHIFT;

    const undergroundRemaining =
      FATIGUE_LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT - shift.totalUndergroundMinutes;
    const undergroundFraction =
      shift.totalUndergroundMinutes / FATIGUE_LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT;

    const shiftStartMs = new Date(shift.startTime).getTime();
    const nowMs = Date.now();
    const shiftElapsedHours = (nowMs - shiftStartMs) / (1000 * 60 * 60);
    const shiftFraction = shiftElapsedHours / FATIGUE_LIMITS.MAX_SHIFT_HOURS;

    return [
      {
        label: 'Entries remaining',
        current: shift.entryCount,
        max: FATIGUE_LIMITS.MAX_ENTRIES_PER_SHIFT,
        unit: `${Math.max(0, entriesRemaining)} left`,
        level: getFatigueLevel(entryFraction),
        displayValue: `${shift.entryCount}/${FATIGUE_LIMITS.MAX_ENTRIES_PER_SHIFT}`,
      },
      {
        label: 'Underground time',
        current: shift.totalUndergroundMinutes,
        max: FATIGUE_LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT,
        unit: `${Math.max(0, Math.round(undergroundRemaining))} min left`,
        level: getFatigueLevel(undergroundFraction),
        displayValue: `${Math.round(shift.totalUndergroundMinutes)}/${FATIGUE_LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT} min`,
      },
      {
        label: 'Shift duration',
        current: shiftElapsedHours,
        max: FATIGUE_LIMITS.MAX_SHIFT_HOURS,
        unit: `${Math.max(0, (FATIGUE_LIMITS.MAX_SHIFT_HOURS - shiftElapsedHours)).toFixed(1)} hrs left`,
        level: getFatigueLevel(shiftFraction),
        displayValue: `${shiftElapsedHours.toFixed(1)}/${FATIGUE_LIMITS.MAX_SHIFT_HOURS} hrs`,
      },
    ];
  }, [shift]);

  const overallLevel = useMemo<FatigueLevel>(() => {
    if (metrics.some((m) => m.level === 'red')) return 'red';
    if (metrics.some((m) => m.level === 'yellow')) return 'yellow';
    return 'green';
  }, [metrics]);

  if (!shift || dismissed) return null;

  const borderColor =
    overallLevel === 'red'
      ? 'border-red-600'
      : overallLevel === 'yellow'
        ? 'border-yellow-600'
        : 'border-green-700';

  const headerBg =
    overallLevel === 'red'
      ? 'bg-red-900/40'
      : overallLevel === 'yellow'
        ? 'bg-yellow-900/30'
        : 'bg-green-900/20';

  return (
    <div
      className={`rounded-xl bg-gray-900 border ${borderColor} overflow-hidden`}
      role="region"
      aria-label="Shift fatigue metrics"
    >
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${LEVEL_COLORS[overallLevel].text}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className={`text-sm font-bold ${LEVEL_COLORS[overallLevel].text}`}>
            {overallLevel === 'red'
              ? t('shift.fatigueWarning')
              : 'Shift Status'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-gray-500 hover:text-gray-300 rounded"
          aria-label={t('common.close')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Metrics */}
      <div className="px-4 py-3 space-y-3">
        {metrics.map((metric) => {
          const colors = LEVEL_COLORS[metric.level];
          const barWidth = Math.min((metric.current / metric.max) * 100, 100);

          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{metric.label}</span>
                <span className={`text-xs font-bold ${colors.text}`}>
                  {metric.displayValue}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="text-right mt-0.5">
                <span className="text-[10px] text-gray-500">{metric.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Limits exceeded warning */}
      {metrics.some((m) => m.current >= m.max) && (
        <div className="px-4 py-2.5 bg-red-900/50 border-t border-red-800">
          <p className="text-red-200 text-xs font-bold text-center">
            {shift.entryCount >= FATIGUE_LIMITS.MAX_ENTRIES_PER_SHIFT
              ? t('shift.maxEntriesReached')
              : t('shift.restRequired')}
          </p>
        </div>
      )}
    </div>
  );
}
