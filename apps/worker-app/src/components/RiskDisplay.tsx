import { useMemo } from 'react';

interface RiskFactors {
  blockageFrequency: number;
  incidentCount: number;
  rainfallFactor: number;
  areaRisk: number;
  gasFactor: number;
  weatherFactor: number;
}

interface Risk {
  riskScore: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'PROHIBITED';
  factors: RiskFactors;
}

interface RiskDisplayProps {
  risk: Risk | null;
}

const RISK_WEIGHTS: Record<keyof RiskFactors, number> = {
  blockageFrequency: 0.25,
  incidentCount: 0.20,
  rainfallFactor: 0.15,
  areaRisk: 0.10,
  gasFactor: 0.20,
  weatherFactor: 0.10,
};

const FACTOR_LABELS: Record<keyof RiskFactors, string> = {
  blockageFrequency: 'Blockage Frequency',
  incidentCount: 'Incident History',
  rainfallFactor: 'Rainfall',
  areaRisk: 'Area Risk',
  gasFactor: 'Gas Levels',
  weatherFactor: 'Weather',
};

const LEVEL_CONFIG = {
  SAFE: {
    ringColor: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Safe for Entry',
    trackColor: 'stroke-green-500',
  },
  CAUTION: {
    ringColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Caution Required',
    trackColor: 'stroke-yellow-500',
  },
  PROHIBITED: {
    ringColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Entry Prohibited',
    trackColor: 'stroke-red-500',
  },
} as const;

function getBarColor(value: number): string {
  if (value < 30) return 'bg-green-500';
  if (value < 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function RiskDisplay({ risk }: RiskDisplayProps) {
  if (!risk) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-400 text-lg">No risk data available</p>
      </div>
    );
  }

  const config = LEVEL_CONFIG[risk.riskLevel];

  const circumference = 2 * Math.PI * 54;
  const scoreOffset = circumference - (risk.riskScore / 100) * circumference;

  const weightedFactors = useMemo(() => {
    return (Object.keys(RISK_WEIGHTS) as (keyof RiskFactors)[]).map((key) => ({
      key,
      label: FACTOR_LABELS[key],
      rawValue: risk.factors[key],
      weight: RISK_WEIGHTS[key],
      weighted: risk.factors[key] * RISK_WEIGHTS[key],
    }));
  }, [risk.factors]);

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-2xl p-6`}>
      {/* Circular Score Indicator */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              className={config.trackColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={scoreOffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-mono ${config.ringColor}`}>
              {Math.round(risk.riskScore)}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">/ 100</span>
          </div>
        </div>

        <div className={`mt-3 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
          risk.riskLevel === 'SAFE' ? 'bg-green-500 text-white' :
          risk.riskLevel === 'CAUTION' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {config.label}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Risk Factors
        </h3>
        {weightedFactors.map(({ key, label, rawValue, weight, weighted }) => (
          <div key={key}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-gray-700">{label}</span>
              <span className="text-xs text-gray-500 font-mono">
                {rawValue.toFixed(0)} x {weight} = {weighted.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(rawValue)}`}
                style={{ width: `${Math.min(100, rawValue)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
