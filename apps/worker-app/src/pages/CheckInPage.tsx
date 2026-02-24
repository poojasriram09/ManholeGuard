import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function CheckInPage() {
  const { checkInId } = useParams();
  const navigate = useNavigate();
  const [responded, setResponded] = useState(false);

  const handleRespond = async (method: string) => {
    try {
      await apiRequest('/checkin/respond', {
        method: 'POST',
        body: JSON.stringify({ checkInId, method }),
      });
      setResponded(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (responded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safe text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold">Check-in confirmed</h1>
          <p className="mt-2">Stay safe!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base bg-grid p-4">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold font-heading text-text-primary mb-4">Are you safe?</h1>
        <p className="mb-8 text-text-secondary">Please confirm you are OK</p>

        <button onClick={() => handleRespond('tap')}
          className="w-64 h-64 rounded-full bg-safe text-white text-3xl font-bold shadow-glow-safe active:scale-95 transition-transform mb-6">
          I'm OK
        </button>

        <p className="text-sm text-text-muted">Tap the button to check in</p>
      </div>
    </div>
  );
}
