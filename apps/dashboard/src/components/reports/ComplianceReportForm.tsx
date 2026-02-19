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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">Generate Compliance Report</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {reportTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manhole ID (optional)</label>
          <input type="text" value={manholeId} onChange={(e) => setManholeId(e.target.value)}
            placeholder="Filter by manhole"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Worker ID (optional)</label>
          <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value)}
            placeholder="Filter by worker"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Generate Report
        </button>
      </div>
    </form>
  );
}
