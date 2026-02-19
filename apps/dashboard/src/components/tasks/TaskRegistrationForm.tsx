import { useState } from 'react';

interface TaskRegistrationFormProps {
  onSubmit: (data: {
    taskType: string;
    description: string;
    manholeId: string;
    assignedWorkerIds: string[];
    priority: string;
    scheduledAt: string;
    allowedDuration: number;
  }) => void;
  workers: Array<{ id: string; name: string }>;
  manholes: Array<{ id: string; qrCodeId?: string; area?: string }>;
  onCancel: () => void;
}

const taskTypes = ['INSPECTION', 'CLEANING', 'REPAIR', 'EMERGENCY', 'ROUTINE_CHECK'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TaskRegistrationForm({ onSubmit, workers, manholes, onCancel }: TaskRegistrationFormProps) {
  const [taskType, setTaskType] = useState('INSPECTION');
  const [description, setDescription] = useState('');
  const [manholeId, setManholeId] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [priority, setPriority] = useState('MEDIUM');
  const [scheduledAt, setScheduledAt] = useState('');
  const [allowedDuration, setAllowedDuration] = useState(60);

  const toggleWorker = (id: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ taskType, description, manholeId, assignedWorkerIds: selectedWorkers, priority, scheduledAt, allowedDuration });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {taskTypes.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          required placeholder="Describe the task..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Manhole</label>
        <select value={manholeId} onChange={(e) => setManholeId(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select manhole...</option>
          {manholes.map((m) => (
            <option key={m.id} value={m.id}>{m.qrCodeId || m.id} {m.area ? `(${m.area})` : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned Workers ({selectedWorkers.length} selected)
        </label>
        <div className="border rounded-lg p-2 max-h-36 overflow-y-auto space-y-1">
          {workers.map((w) => (
            <label key={w.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <input type="checkbox" checked={selectedWorkers.includes(w.id)}
                onChange={() => toggleWorker(w.id)} className="rounded" />
              {w.name}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Duration (min)</label>
          <input type="number" value={allowedDuration} onChange={(e) => setAllowedDuration(Number(e.target.value))}
            min={10} max={480}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Create Task
        </button>
      </div>
    </form>
  );
}
