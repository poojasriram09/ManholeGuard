import { useState } from 'react';

interface ComplianceReportFormProps {
  onGenerate: (params: {
    reportType: string;
    from: string;
    to: string;
    manholeId?: string;
    workerId?: string;
  }) => void;
}

const reportTypes = [
  { value: 'dailyOps', label: 'Daily Operations' },
  { value: 'monthlySummary', label: 'Monthly Summary' },
  { value: 'incidentInvestigation', label: 'Incident Investigation' },
  { value: 'manholeInspection', label: 'Manhole Inspection' },
  { value: 'workerSafetyCard', label: 'Worker Safety Card' },
  { value: 'annualAudit', label: 'Annual Audit' },
];

export default function ComplianceReportForm({ onGenerate }: ComplianceReportFormProps) {
  const [reportType, setReportType] = useState('dailyOps');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [manholeId, setManholeId] = useState('');
  const [workerId, setWorkerId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      reportType,
      from,
      to,
      ...(manholeId && { manholeId }),
      ...(workerId && { workerId }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
      <h3 className="font-heading font-semibold text-text-primary">Generate Compliance Report</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}
            className="input-dark w-full">
            {reportTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            required className="input-dark w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            required className="input-dark w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Manhole ID (optional)</label>
          <input type="text" value={manholeId} onChange={(e) => setManholeId(e.target.value)}
            placeholder="Filter by manhole"
            className="input-dark w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Worker ID (optional)</label>
          <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value)}
            placeholder="Filter by worker"
            className="input-dark w-full" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary px-5 py-2">
          Generate Report
        </button>
      </div>
    </form>
  );
}
