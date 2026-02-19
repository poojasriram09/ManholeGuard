import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GAS_THRESHOLDS,
  OXYGEN_THRESHOLD,
} from '@manholeguard/shared/src/constants/gas-thresholds';

interface GasReadings {
  h2s: number;
  ch4: number;
  co: number;
  o2: number;
  co2: number;
  nh3: number;
}

interface GasReadingDisplayProps {
  readings: GasReadings | null;
}

type GasLevel = 'safe' | 'warning' | 'danger';

interface GasDisplayEntry {
  id: string;
  name: string;
  value: number;
  unit: string;
  level: GasLevel;
}

function getGasLevel(gasId: string, value: number): GasLevel {
  if (gasId === 'o2') {
    // Oxygen: too low or too high is dangerous
    if (value < OXYGEN_THRESHOLD.low || value > OXYGEN_THRESHOLD.high) {
      return 'danger';
    }
    // Slightly outside normal range
    if (value < 19.8 || value > 23.2) {
      return 'warning';
    }
    return 'safe';
  }

  const threshold = GAS_THRESHOLDS[gasId];
  if (!threshold) return 'safe';

  if (value >= threshold.danger) return 'danger';
  if (value >= threshold.warning) return 'warning';
  return 'safe';
}

const LEVEL_STYLES: Record<GasLevel, { bg: string; text: string; border: string; icon: string }> = {
  safe: {
    bg: 'bg-green-900/40',
    text: 'text-green-400',
    border: 'border-green-700',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-900/40',
    text: 'text-yellow-300',
    border: 'border-yellow-600',
    icon: 'text-yellow-400',
  },
  danger: {
    bg: 'bg-red-900/50',
    text: 'text-red-300',
    border: 'border-red-600',
    icon: 'text-red-400',
  },
};

export default function GasReadingDisplay({ readings }: GasReadingDisplayProps) {
  const { t } = useTranslation();

  const gasEntries = useMemo<GasDisplayEntry[]>(() => {
    if (!readings) return [];

    return [
      {
        id: 'h2s',
        name: GAS_THRESHOLDS.h2s.name,
        value: readings.h2s,
        unit: GAS_THRESHOLDS.h2s.unit,
        level: getGasLevel('h2s', readings.h2s),
      },
      {
        id: 'ch4',
        name: GAS_THRESHOLDS.ch4.name,
        value: readings.ch4,
        unit: GAS_THRESHOLDS.ch4.unit,
        level: getGasLevel('ch4', readings.ch4),
      },
      {
        id: 'co',
        name: GAS_THRESHOLDS.co.name,
        value: readings.co,
        unit: GAS_THRESHOLDS.co.unit,
        level: getGasLevel('co', readings.co),
      },
      {
        id: 'o2',
        name: OXYGEN_THRESHOLD.name,
        value: readings.o2,
        unit: OXYGEN_THRESHOLD.unit,
        level: getGasLevel('o2', readings.o2),
      },
      {
        id: 'co2',
        name: GAS_THRESHOLDS.co2.name,
        value: readings.co2,
        unit: GAS_THRESHOLDS.co2.unit,
        level: getGasLevel('co2', readings.co2),
      },
      {
        id: 'nh3',
        name: GAS_THRESHOLDS.nh3.name,
        value: readings.nh3,
        unit: GAS_THRESHOLDS.nh3.unit,
        level: getGasLevel('nh3', readings.nh3),
      },
    ];
  }, [readings]);

  const overallLevel = useMemo<GasLevel>(() => {
    if (gasEntries.some((e) => e.level === 'danger')) return 'danger';
    if (gasEntries.some((e) => e.level === 'warning')) return 'warning';
    return 'safe';
  }, [gasEntries]);

  if (!readings) {
    return (
      <div className="rounded-xl bg-gray-800 p-4 border border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">No gas sensor data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 overflow-hidden" role="region" aria-label="Gas readings">
      {/* Header with overall status */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          overallLevel === 'danger'
            ? 'bg-red-900/60'
            : overallLevel === 'warning'
              ? 'bg-yellow-900/40'
              : 'bg-green-900/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {overallLevel === 'danger' ? (
            <svg className="w-5 h-5 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${LEVEL_STYLES[overallLevel].icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
          <span className={`text-sm font-bold ${LEVEL_STYLES[overallLevel].text}`}>
            {overallLevel === 'danger'
              ? t('gas.danger')
              : overallLevel === 'warning'
                ? t('gas.warning')
                : t('gas.safe')}
          </span>
        </div>
      </div>

      {/* Gas readings grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-800">
        {gasEntries.map((gas) => {
          const styles = LEVEL_STYLES[gas.level];
          return (
            <div
              key={gas.id}
              className={`p-3 ${styles.bg} border-b ${styles.border}`}
              role="group"
              aria-label={`${gas.name}: ${gas.value} ${gas.unit}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  {gas.id.toUpperCase()}
                </span>
                {gas.level !== 'safe' && (
                  <span
                    className={`
                      inline-block w-2 h-2 rounded-full
                      ${gas.level === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}
                    `}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className={`text-xl font-bold font-mono ${styles.text}`}>
                {gas.id === 'o2' ? gas.value.toFixed(1) : gas.value.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-500">{gas.unit}</span>
                <span className="text-xs text-gray-500">{gas.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger banner */}
      {overallLevel === 'danger' && (
        <div className="px-4 py-3 bg-red-800 text-center animate-pulse">
          <span className="text-red-100 text-sm font-bold uppercase tracking-wider">
            {t('gas.evacuate')}
          </span>
        </div>
      )}
    </div>
  );
}
