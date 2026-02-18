import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function TrackStatusPage() {
  const [code, setCode] = useState('');
  const [grievance, setGrievance] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGrievance(null);
    try {
      const res = await fetch(`${API_URL}/public/grievance/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Not found');
      setGrievance(data.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Track Your Report</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" placeholder="Enter tracking code (e.g., MHG-2026-XXXXX)" value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 border rounded-lg px-3 py-2 font-mono" required />
        <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 font-semibold">Search</button>
      </form>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      {grievance && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-gray-500">Tracking Code</span>
              <p className="font-mono font-bold text-lg">{grievance.trackingCode}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[grievance.status] || ''}`}>
              {grievance.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Issue Type:</span> <span className="capitalize">{grievance.issueType.replace('_', ' ')}</span></div>
            <div><span className="text-gray-500">Description:</span> <p className="mt-1">{grievance.description}</p></div>
            {grievance.address && <div><span className="text-gray-500">Address:</span> {grievance.address}</div>}
            <div><span className="text-gray-500">Submitted:</span> {new Date(grievance.createdAt).toLocaleDateString()}</div>
            {grievance.resolutionNotes && (
              <div className="bg-green-50 p-3 rounded">
                <span className="text-gray-500">Resolution:</span>
                <p className="mt-1">{grievance.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
