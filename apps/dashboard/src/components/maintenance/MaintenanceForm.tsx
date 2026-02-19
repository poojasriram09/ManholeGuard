import { useState, useEffect } from 'react';

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Manhole</label>
        <select value={manholeId} onChange={(e) => setManholeId(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select manhole...</option>
          {manholes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.qrCodeId || m.id} {m.area ? `(${m.area})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {maintenanceTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
          required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Team</label>
        <input type="text" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)}
          placeholder="e.g. Team Alpha"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Additional notes..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {maintenance ? 'Update' : 'Schedule'}
        </button>
      </div>
    </form>
  );
}
