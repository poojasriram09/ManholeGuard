import { useState, FormEvent } from 'react';

interface ManholeFormProps {
  manhole?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ManholeForm({ manhole, onSubmit, onCancel }: ManholeFormProps) {
  const [form, setForm] = useState({
    qrCodeId: manhole?.qrCodeId ?? '',
    area: manhole?.area ?? '',
    address: manhole?.address ?? '',
    latitude: manhole?.latitude ?? '',
    longitude: manhole?.longitude ?? '',
    depth: manhole?.depth ?? '',
    diameter: manhole?.diameter ?? '',
    maxWorkers: manhole?.maxWorkers ?? 2,
    geoFenceRadius: manhole?.geoFenceRadius ?? 50,
    hasGasSensor: manhole?.hasGasSensor ?? false,
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      depth: parseFloat(form.depth) || 0,
      diameter: parseFloat(form.diameter) || 0,
      maxWorkers: parseInt(form.maxWorkers, 10) || 2,
      geoFenceRadius: parseInt(form.geoFenceRadius, 10) || 50,
    });
  };

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">QR Code ID</label>
          <input className={inputClass} value={form.qrCodeId} onChange={(e) => set('qrCodeId', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Area</label>
          <input className={inputClass} value={form.area} onChange={(e) => set('area', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
          <input className={inputClass} type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
          <input className={inputClass} type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Depth (m)</label>
          <input className={inputClass} type="number" step="0.1" value={form.depth} onChange={(e) => set('depth', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Diameter (m)</label>
          <input className={inputClass} type="number" step="0.1" value={form.diameter} onChange={(e) => set('diameter', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max Workers</label>
          <input className={inputClass} type="number" min={1} value={form.maxWorkers} onChange={(e) => set('maxWorkers', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Geo-fence Radius (m)</label>
          <input className={inputClass} type="number" min={10} value={form.geoFenceRadius} onChange={(e) => set('geoFenceRadius', e.target.value)} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="gasSensor" checked={form.hasGasSensor} onChange={(e) => set('hasGasSensor', e.target.checked)} className="rounded" />
          <label htmlFor="gasSensor" className="text-sm text-gray-700">Has Gas Sensor</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          {manhole ? 'Update Manhole' : 'Create Manhole'}
        </button>
      </div>
    </form>
  );
}
