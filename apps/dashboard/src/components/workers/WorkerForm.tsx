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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Name</label>
          <input className="input-dark w-full" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Employee ID</label>
          <input className="input-dark w-full" value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Phone</label>
          <input className="input-dark w-full" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Email</label>
          <input className="input-dark w-full" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Blood Group</label>
          <select className="input-dark w-full" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Emergency Contact Name</label>
          <input className="input-dark w-full" value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Emergency Contact Phone</label>
          <input className="input-dark w-full" type="tel" value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">Cancel</button>
        <button type="submit" className="btn-primary">
          {worker ? 'Update Worker' : 'Create Worker'}
        </button>
      </div>
    </form>
  );
}
