import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';

const REPORT_TYPES = [
  { value: 'dailyOps', label: 'Daily Operations' },
  { value: 'monthlySummary', label: 'Monthly Summary' },
  { value: 'incidentInvestigation', label: 'Incident Investigation' },
  { value: 'manholeInspection', label: 'Manhole Inspection' },
  { value: 'workerSafetyCard', label: 'Worker Safety Card' },
  { value: 'annualAudit', label: 'Annual Audit' },
];

export default function ComplianceReportsPage() {
  const [type, setType] = useState('dailyOps');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: (params: any) => api.post<{ data: any }>('/reports/generate', params),
    onSuccess: (data) => setReport(data.data),
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      type,
      from: from || undefined,
      to: to || undefined,
      generatedBy: 'dashboard',
    });
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Compliance Reports</h1>

      <div className="card-surface p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Report Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="input-dark w-full">
              {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="input-dark w-full" />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={generateMutation.isPending}
              className="w-full btn-primary py-2.5">
              {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="card-surface p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-text-primary">{REPORT_TYPES.find((t) => t.value === report.type)?.label}</h2>
            <div className="space-x-2">
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))}
                className="px-3 py-1 rounded text-sm bg-surface-elevated text-text-secondary border border-border hover:bg-surface-hover transition-colors">Copy JSON</button>
            </div>
          </div>
          {report.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.summary).map(([key, value]) => (
                <div key={key} className="bg-surface-base border border-border rounded-lg p-3">
                  <p className="text-xs text-text-muted">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-lg font-heading font-semibold text-text-primary">{typeof value === 'number' ? Math.round(value as number * 10) / 10 : String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
