import { useState } from 'react';

interface MaintenanceFormProps {
  onSubmit: (data: {
    manholeId: string;
    type: string;
    scheduledAt: string;
    assignedTeam: string;
    notes: string;
  }) => void;
  manholes: Array<{ id: string; qrCodeId?: string; area?: string }>;
  maintenance?: {
    manholeId?: string;
    type?: string;
    scheduledAt?: string;
    assignedTeam?: string;
    notes?: string;
  };
  onCancel: () => void;
}

const maintenanceTypes = [
  'INSPECTION', 'CLEANING', 'REPAIR', 'REPLACEMENT', 'GAS_CHECK', 'STRUCTURAL',
];

export default function MaintenanceForm({ onSubmit, manholes, maintenance, onCancel }: MaintenanceFormProps) {
  const [manholeId, setManholeId] = useState(maintenance?.manholeId || '');
  const [type, setType] = useState(maintenance?.type || 'INSPECTION');
  const [scheduledAt, setScheduledAt] = useState(maintenance?.scheduledAt?.slice(0, 16) || '');
  const [assignedTeam, setAssignedTeam] = useState(maintenance?.assignedTeam || '');
  const [notes, setNotes] = useState(maintenance?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ manholeId, type, scheduledAt, assignedTeam, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Manhole</label>
        <select value={manholeId} onChange={(e) => setManholeId(e.target.value)} required
          className="input-dark w-full">
          <option value="">Select manhole...</option>
          {manholes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.qrCodeId || m.id} {m.area ? `(${m.area})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="input-dark w-full">
          {maintenanceTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Scheduled At</label>
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
          required className="input-dark w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Assigned Team</label>
        <input type="text" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)}
          placeholder="e.g. Team Alpha"
          className="input-dark w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Additional notes..."
          className="input-dark w-full" />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {maintenance ? 'Update' : 'Schedule'}
        </button>
      </div>
    </form>
  );
}
