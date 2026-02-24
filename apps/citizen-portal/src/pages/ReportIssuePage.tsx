import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ISSUE_TYPES = [
  { value: 'open_manhole', label: 'Open / Uncovered Manhole' },
  { value: 'overflow', label: 'Sewage Overflow' },
  { value: 'foul_smell', label: 'Foul Smell' },
  { value: 'blockage', label: 'Blockage' },
  { value: 'structural_damage', label: 'Structural Damage' },
];

function LocationPicker({ position, setPosition }: { position: [number, number] | null; setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function ReportIssuePage() {
  const [form, setForm] = useState({
    reporterName: '', reporterPhone: '', reporterEmail: '',
    issueType: '', description: '', address: '',
  });
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/public/grievance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: position?.[0],
          longitude: position?.[1],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Submission failed');
      setTrackingCode(data.data.trackingCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">&#10003;</div>
        <h2 className="text-2xl font-bold mb-2 text-text-primary font-heading">Report Submitted</h2>
        <p className="text-text-secondary mb-6">Your tracking code:</p>
        <div className="bg-accent-muted border-2 border-accent/30 rounded-xl p-6 inline-block">
          <span className="text-3xl font-mono font-bold text-accent">{trackingCode}</span>
        </div>
        <p className="text-sm text-text-muted mt-4">Save this code to track your report status</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 font-heading text-text-primary">Report a Manhole Issue</h2>
      {error && <div className="bg-danger-muted text-danger p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Your Name *</label>
          <input type="text" required value={form.reporterName} onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
            className="input-dark w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number *</label>
          <input type="tel" required value={form.reporterPhone} onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
            className="input-dark w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email (optional)</label>
          <input type="email" value={form.reporterEmail} onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
            className="input-dark w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Issue Type *</label>
          <select required value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}
            className="input-dark w-full">
            <option value="">Select type...</option>
            {ISSUE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-dark w-full" placeholder="Describe the issue in detail..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input-dark w-full" placeholder="Nearby landmark or address" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Pin Location on Map</label>
          <div className="h-64 rounded-lg overflow-hidden border border-border">
            <MapContainer center={[19.076, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          {position && <p className="text-xs text-text-muted mt-1">Location: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3 font-semibold disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
