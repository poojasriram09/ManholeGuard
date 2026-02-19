import Modal from '../common/Modal';
import Badge from '../common/Badge';

interface WorkerDetailModalProps {
  worker: any;
  open: boolean;
  onClose: () => void;
}

export default function WorkerDetailModal({ worker, open, onClose }: WorkerDetailModalProps) {
  if (!worker) return null;

  const fatigue = worker.fatigue;

  return (
    <Modal open={open} onClose={onClose} title="Worker Details" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Name</p>
            <p className="font-medium">{worker.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Employee ID</p>
            <p className="font-medium font-mono">{worker.employeeId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Phone</p>
            <p className="font-medium">{worker.phone ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <p className="font-medium">{worker.email ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Blood Group</p>
            <p className="font-medium">{worker.bloodGroup ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Emergency Contact</p>
            <p className="font-medium">{worker.emergencyContactName ?? '---'} ({worker.emergencyContactPhone ?? '---'})</p>
          </div>
        </div>

        {fatigue && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Fatigue Status</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded p-3 text-center">
                <p className="text-xs text-gray-500">Entries Today</p>
                <p className="text-lg font-bold">{fatigue.currentEntries ?? 0} / {fatigue.maxEntries ?? 4}</p>
              </div>
              <div className="bg-gray-50 rounded p-3 text-center">
                <p className="text-xs text-gray-500">Time Underground</p>
                <p className="text-lg font-bold">{fatigue.undergroundMinutes ?? 0} min</p>
              </div>
              <div className="bg-gray-50 rounded p-3 text-center">
                <p className="text-xs text-gray-500">Fatigue Score</p>
                <p className={`text-lg font-bold ${(fatigue.score ?? 0) >= 80 ? 'text-red-600' : (fatigue.score ?? 0) >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {fatigue.score ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {worker.certifications && worker.certifications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Certifications</h3>
            <ul className="space-y-1">
              {worker.certifications.map((cert: any, i: number) => {
                const expired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>{cert.type} &mdash; {cert.number}</span>
                    <Badge variant={expired ? 'danger' : 'success'}>{expired ? 'Expired' : 'Valid'}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {worker.recentEntries && worker.recentEntries.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Entries</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {worker.recentEntries.slice(0, 5).map((e: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{e.manhole?.area ?? 'Unknown'}</span>
                  <span className="text-gray-400">{new Date(e.entryTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
