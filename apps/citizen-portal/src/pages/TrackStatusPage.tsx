import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-accent-muted text-accent',
  UNDER_REVIEW: 'bg-caution-muted text-caution',
  IN_PROGRESS: 'bg-caution-muted text-caution',
  RESOLVED: 'bg-safe-muted text-safe',
  CLOSED: 'bg-surface-elevated text-text-primary',
};

const STATUS_ORDER = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function getStatusIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function TrackStatusPage() {
  const [code, setCode] = useState('');
  const [grievance, setGrievance] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGrievance(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/grievance/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Not found');
      setGrievance(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = grievance ? getStatusIndex(grievance.status) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 font-heading text-text-primary">Track Your Report</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" placeholder="Enter tracking code (e.g., MHG-2026-XXXXX)" value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="input-dark flex-1 font-mono" required />
        <button type="submit" disabled={loading}
          className="btn-primary px-6 py-2 font-semibold disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="bg-danger-muted text-danger p-3 rounded mb-4">{error}</div>}

      {grievance && (
        <div className="card-surface p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-text-muted">Tracking Code</span>
              <p className="font-mono font-bold text-lg text-text-primary">{grievance.trackingCode}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[grievance.status] || ''}`}>
              {grievance.status.replace('_', ' ')}
            </span>
          </div>

          {/* Timeline View */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {STATUS_ORDER.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStep ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted'
                  }`}>
                    {i < currentStep ? '\u2713' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${i <= currentStep ? 'text-accent font-medium' : 'text-text-muted'}`}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-1">
              {STATUS_ORDER.slice(0, -1).map((_, i) => (
                <div key={i} className={`flex-1 h-1 mx-1 rounded ${i < currentStep ? 'bg-accent' : 'bg-surface-elevated'}`} />
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div><span className="text-text-muted">Issue Type:</span> <span className="capitalize">{grievance.issueType.replace('_', ' ')}</span></div>
            <div><span className="text-text-muted">Description:</span> <p className="mt-1">{grievance.description}</p></div>
            {grievance.address && <div><span className="text-text-muted">Address:</span> {grievance.address}</div>}
            <div><span className="text-text-muted">Submitted:</span> {new Date(grievance.createdAt).toLocaleDateString()}</div>
            {grievance.updatedAt && grievance.updatedAt !== grievance.createdAt && (
              <div><span className="text-text-muted">Last Updated:</span> {new Date(grievance.updatedAt).toLocaleDateString()}</div>
            )}
            {grievance.resolvedAt && (
              <div><span className="text-text-muted">Resolved:</span> {new Date(grievance.resolvedAt).toLocaleDateString()}</div>
            )}
            {grievance.resolutionNotes && (
              <div className="bg-safe-muted p-4 rounded-lg mt-4">
                <span className="text-text-secondary font-medium">Resolution Notes:</span>
                <p className="mt-1">{grievance.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Estimated time */}
          {['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(grievance.status) && (
            <div className="mt-6 bg-accent-muted p-4 rounded-lg text-sm text-accent">
              Your report is being processed. Expected resolution within 30 days of submission.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
