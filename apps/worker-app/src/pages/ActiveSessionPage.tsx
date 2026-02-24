import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function ActiveSessionPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    apiRequest<{ data: any }>(`/entry/${entryId}`).then((r) => setEntry(r.data));
  }, [entryId]);

  useEffect(() => {
    if (!entry) return;
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - new Date(entry.entryTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [entry]);

  const handleExit = async () => {
    await apiRequest(`/entry/${entryId}/exit`, { method: 'POST' });
    navigate(`/health/${entryId}`);
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const allowed = entry?.allowedDurationMinutes ?? 45;
  const progress = Math.min(100, (minutes / allowed) * 100);
  const isOvertime = minutes >= allowed;

  return (
    <div className="p-4 text-center animate-fade-in-up">
      <h1 className="text-xl font-bold font-heading text-text-primary mb-2">Active Session</h1>
      <p className="text-text-secondary mb-6">{entry?.manhole?.area} — {entry?.manhole?.qrCodeId}</p>

      <div className={`text-6xl font-mono font-bold mb-4 ${isOvertime ? 'text-danger' : 'text-accent'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="w-full bg-surface-elevated rounded-full h-3 mb-2">
        <div className={`h-3 rounded-full transition-all ${isOvertime ? 'bg-danger' : progress > 80 ? 'bg-caution' : 'bg-safe'}`}
          style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-text-muted mb-8">Allowed: {allowed} minutes</p>

      <button onClick={handleExit} className="btn-primary w-full rounded-xl py-4 text-lg font-semibold mb-4">
        Confirm Exit
      </button>

      <button onClick={() => navigate('/sos')} className="w-full bg-danger text-white rounded-xl py-4 text-lg font-semibold">
        SOS Emergency
      </button>
    </div>
  );
}
