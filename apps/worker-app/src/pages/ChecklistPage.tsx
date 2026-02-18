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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pre-Entry Safety Checklist</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-2 mb-6">
        {PPE_ITEMS.map((item) => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
              checked[item.id] ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
            }`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
              checked[item.id] ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
            }`}>
              {checked[item.id] && '✓'}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{item.label}</p>
              {item.mandatory && <p className="text-xs text-red-500">Required</p>}
            </div>
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!allMandatoryChecked}
        className={`w-full rounded-xl py-4 text-lg font-semibold ${
          allMandatoryChecked ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
        {allMandatoryChecked ? 'Confirm & Enter' : 'Complete all required items'}
      </button>
    </div>
  );
}
