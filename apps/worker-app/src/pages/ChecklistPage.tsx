import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

const PPE_ITEMS = [
  { id: 'helmet', label: 'Safety helmet with headlamp', mandatory: true },
  { id: 'gas_detector', label: 'Personal gas detector', mandatory: true },
  { id: 'harness', label: 'Full-body safety harness + lifeline', mandatory: true },
  { id: 'gloves', label: 'Rubber gloves (elbow-length)', mandatory: true },
  { id: 'boots', label: 'Gumboots (anti-slip, steel-toe)', mandatory: true },
  { id: 'vest', label: 'Reflective safety vest', mandatory: true },
  { id: 'respirator', label: 'Face mask / respirator', mandatory: true },
  { id: 'firstaid', label: 'First-aid kit accessible', mandatory: true },
  { id: 'comms', label: 'Communication device charged', mandatory: true },
  { id: 'tripod', label: 'Tripod and winch at opening', mandatory: true },
  { id: 'ventilation', label: 'Ventilation fan running', mandatory: false },
  { id: 'supervisor', label: 'Supervisor present at site', mandatory: true },
];

export default function ChecklistPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  const allMandatoryChecked = PPE_ITEMS.filter((i) => i.mandatory).every((i) => checked[i.id]);

  const handleSubmit = async () => {
    try {
      const items = PPE_ITEMS.map((i) => ({ id: i.id, checked: !!checked[i.id] }));
      await apiRequest('/checklist', {
        method: 'POST',
        body: JSON.stringify({ entryLogId: entryId, items }),
      });
      navigate(`/session/${entryId}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 animate-fade-in-up">
      <h1 className="text-xl font-bold font-heading text-text-primary mb-4">Pre-Entry Safety Checklist</h1>
      {error && <div className="bg-danger-muted text-danger p-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-2 mb-6">
        {PPE_ITEMS.map((item) => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
              checked[item.id] ? 'border-safe bg-safe-muted' : 'border-border bg-surface-card'
            }`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
              checked[item.id] ? 'border-safe bg-safe text-white' : 'border-text-muted'
            }`}>
              {checked[item.id] && '✓'}
            </div>
            <div className="text-left">
              <p className="text-text-primary text-sm font-medium">{item.label}</p>
              {item.mandatory && <p className="text-danger text-xs">Required</p>}
            </div>
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!allMandatoryChecked}
        className={`w-full rounded-xl py-4 text-lg font-semibold ${
          allMandatoryChecked ? 'bg-safe text-white' : 'bg-surface-elevated text-text-muted'
        }`}>
        {allMandatoryChecked ? 'Confirm & Enter' : 'Complete all required items'}
      </button>
    </div>
  );
}
