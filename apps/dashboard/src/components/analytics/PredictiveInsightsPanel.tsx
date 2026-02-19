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
  risk: 'border-danger bg-danger-muted',
  maintenance: 'border-caution bg-caution-muted',
  safety: 'border-accent bg-accent-muted',
  performance: 'border-safe bg-safe-muted',
};

export default function PredictiveInsightsPanel({ insights }: PredictiveInsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No predictive insights available.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-heading font-semibold text-text-primary mb-4">Predictive Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li
            key={i}
            className={`border-l-4 rounded-lg p-3 ${typeColors[insight.type] || 'border-border bg-surface-elevated'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-xs font-medium text-text-muted uppercase">{insight.type}</span>
                <p className="text-sm text-text-primary mt-0.5">{insight.description}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Recommended: <span className="font-medium">{insight.action}</span>
                </p>
              </div>
              <span className="ml-3 text-sm font-heading font-bold text-text-primary whitespace-nowrap">
                {insight.confidence}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
