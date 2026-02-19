interface Insight {
  type: string;
  description: string;
  confidence: number;
  action: string;
}

interface PredictiveInsightsPanelProps {
  insights: Insight[];
}

const typeColors: Record<string, string> = {
  risk: 'border-red-400 bg-red-50',
  maintenance: 'border-yellow-400 bg-yellow-50',
  safety: 'border-blue-400 bg-blue-50',
  performance: 'border-green-400 bg-green-50',
};

export default function PredictiveInsightsPanel({ insights }: PredictiveInsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No predictive insights available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Predictive Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li
            key={i}
            className={`border-l-4 rounded-lg p-3 ${typeColors[insight.type] || 'border-gray-300 bg-gray-50'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-500 uppercase">{insight.type}</span>
                <p className="text-sm text-gray-800 mt-0.5">{insight.description}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Recommended: <span className="font-medium">{insight.action}</span>
                </p>
              </div>
              <span className="ml-3 text-sm font-bold text-gray-700 whitespace-nowrap">
                {insight.confidence}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
