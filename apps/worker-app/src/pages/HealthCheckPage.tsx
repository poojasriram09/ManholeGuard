import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

const SYMPTOMS = [
  { id: 'dizziness', label: 'Dizziness / lightheadedness', serious: true },
  { id: 'nausea', label: 'Nausea / vomiting', serious: true },
  { id: 'breathlessness', label: 'Difficulty breathing', serious: true },
  { id: 'skin_irritation', label: 'Skin irritation / rash', serious: false },
  { id: 'eye_irritation', label: 'Eye irritation / burning', serious: false },
  { id: 'headache', label: 'Headache', serious: false },
  { id: 'chest_pain', label: 'Chest pain / tightness', serious: true },
  { id: 'none', label: 'None — I feel fine', serious: false },
];

export default function HealthCheckPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (id === 'none') {
      setSelected(['none']);
    } else {
      setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p.filter((s) => s !== 'none'), id]);
    }
  };

  const handleSubmit = async () => {
    const feelingOk = selected.includes('none') || selected.length === 0;
    await apiRequest('/health/check', {
      method: 'POST',
      body: JSON.stringify({ entryLogId: entryId, feelingOk, symptoms: selected.filter((s) => s !== 'none') }),
    });
    setSubmitted(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safe text-white text-center">
        <div>
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold">Health check recorded</h1>
          <p className="mt-2">Thank you for your safety. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in-up">
      <h1 className="text-xl font-bold font-heading text-text-primary mb-2">Post-Exit Health Check</h1>
      <p className="text-text-secondary mb-4">How are you feeling after this entry?</p>

      <div className="space-y-2 mb-6">
        {SYMPTOMS.map((s) => (
          <button key={s.id} onClick={() => toggle(s.id)}
            className={`w-full flex items-center p-4 rounded-xl border-2 ${
              selected.includes(s.id) ? (s.serious ? 'border-danger bg-danger-muted' : 'border-safe bg-safe-muted') : 'border-border bg-surface-card'
            }`}>
            <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center text-sm ${
              selected.includes(s.id) ? (s.serious ? 'bg-danger border-danger text-white' : 'bg-safe border-safe text-white') : 'border-text-muted'
            }`}>
              {selected.includes(s.id) && '✓'}
            </div>
            <span className="text-sm text-text-primary">{s.label}</span>
            {s.serious && <span className="ml-auto text-xs text-danger">Serious</span>}
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full rounded-xl py-4 text-lg font-semibold">
        Submit Health Check
      </button>
    </div>
  );
}
