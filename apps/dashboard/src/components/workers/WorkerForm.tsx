import { useState, FormEvent } from 'react';

interface WorkerFormProps {
  worker?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function WorkerForm({ worker, onSubmit, onCancel }: WorkerFormProps) {
  const [form, setForm] = useState({
    name: worker?.name ?? '',
    employeeId: worker?.employeeId ?? '',
    phone: worker?.phone ?? '',
    email: worker?.email ?? '',
    bloodGroup: worker?.bloodGroup ?? '',
    emergencyContactName: worker?.emergencyContactName ?? '',
    emergencyContactPhone: worker?.emergencyContactPhone ?? '',
  });

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Employee ID</label>
          <input className={inputClass} value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input className={inputClass} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
          <select className={inputClass} value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Name</label>
          <input className={inputClass} value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Phone</label>
          <input className={inputClass} type="tel" value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          {worker ? 'Update Worker' : 'Create Worker'}
        </button>
      </div>
    </form>
  );
}
