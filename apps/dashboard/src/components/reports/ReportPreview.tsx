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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No report data to preview.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-lg font-bold text-gray-900">{report.title || 'Report'}</h2>
        <div className="flex gap-4 text-xs text-gray-500 mt-1">
          {report.type && <span>Type: {report.type}</span>}
          {report.generatedAt && <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>}
          {report.period && <span>Period: {report.period.from} to {report.period.to}</span>}
        </div>
      </div>

      {report.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">{report.summary}</p>
        </div>
      )}

      {report.sections?.map((section, i) => (
        <div key={i}>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{section.heading}</h3>
          {typeof section.content === 'string' ? (
            <p className="text-sm text-gray-600">{section.content}</p>
          ) : (
            <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
