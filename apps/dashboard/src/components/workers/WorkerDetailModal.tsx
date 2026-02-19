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
            <p className="text-xs text-text-muted uppercase">Name</p>
            <p className="font-medium text-text-primary">{worker.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Employee ID</p>
            <p className="font-medium font-mono text-text-primary">{worker.employeeId}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Phone</p>
            <p className="font-medium text-text-primary">{worker.phone ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Email</p>
            <p className="font-medium text-text-primary">{worker.email ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Blood Group</p>
            <p className="font-medium text-text-primary">{worker.bloodGroup ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Emergency Contact</p>
            <p className="font-medium text-text-primary">{worker.emergencyContactName ?? '---'} ({worker.emergencyContactPhone ?? '---'})</p>
          </div>
        </div>

        {fatigue && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">Fatigue Status</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Entries Today</p>
                <p className="text-lg font-heading font-bold text-text-primary">{fatigue.currentEntries ?? 0} / {fatigue.maxEntries ?? 4}</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Time Underground</p>
                <p className="text-lg font-heading font-bold text-text-primary">{fatigue.undergroundMinutes ?? 0} min</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Fatigue Score</p>
                <p className={`text-lg font-heading font-bold ${(fatigue.score ?? 0) >= 80 ? 'text-danger' : (fatigue.score ?? 0) >= 50 ? 'text-caution' : 'text-safe'}`}>
                  {fatigue.score ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {worker.certifications && worker.certifications.length > 0 && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">Certifications</h3>
            <ul className="space-y-1">
              {worker.certifications.map((cert: any, i: number) => {
                const expired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{cert.type} &mdash; {cert.number}</span>
                    <Badge variant={expired ? 'danger' : 'success'}>{expired ? 'Expired' : 'Valid'}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {worker.recentEntries && worker.recentEntries.length > 0 && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">Recent Entries</h3>
            <ul className="space-y-1 text-sm text-text-secondary">
              {worker.recentEntries.slice(0, 5).map((e: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{e.manhole?.area ?? 'Unknown'}</span>
                  <span className="text-text-muted">{new Date(e.entryTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
