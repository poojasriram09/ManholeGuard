interface ReportPreviewProps {
  report: {
    title?: string;
    type?: string;
    generatedAt?: string;
    period?: { from: string; to: string };
    sections?: Array<{
      heading: string;
      content: string | Record<string, any>;
    }>;
    summary?: string;
  };
}

export default function ReportPreview({ report }: ReportPreviewProps) {
  if (!report) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No report data to preview.
      </div>
    );
  }

  return (
    <div className="card-surface p-6 space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-heading font-bold text-text-primary">{report.title || 'Report'}</h2>
        <div className="flex gap-4 text-xs text-text-muted mt-1">
          {report.type && <span>Type: {report.type}</span>}
          {report.generatedAt && <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>}
          {report.period && <span>Period: {report.period.from} to {report.period.to}</span>}
        </div>
      </div>

      {report.summary && (
        <div className="bg-accent-muted border border-accent/20 rounded-lg p-3">
          <p className="text-sm text-accent-strong">{report.summary}</p>
        </div>
      )}

      {report.sections?.map((section, i) => (
        <div key={i}>
          <h3 className="text-sm font-heading font-semibold text-text-primary mb-1">{section.heading}</h3>
          {typeof section.content === 'string' ? (
            <p className="text-sm text-text-secondary">{section.content}</p>
          ) : (
            <pre className="text-xs bg-surface-elevated rounded-lg p-3 overflow-x-auto text-text-secondary font-mono">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
