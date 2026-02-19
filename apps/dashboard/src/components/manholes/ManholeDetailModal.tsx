import Modal from '../common/Modal';
import RiskBadge from '../common/RiskBadge';

interface ManholeDetailModalProps {
  manhole: any;
  open: boolean;
  onClose: () => void;
}

function riskLevel(score: number): 'SAFE' | 'CAUTION' | 'PROHIBITED' {
  if (score < 30) return 'SAFE';
  if (score < 60) return 'CAUTION';
  return 'PROHIBITED';
}

export default function ManholeDetailModal({ manhole, open, onClose }: ManholeDetailModalProps) {
  if (!manhole) return null;

  return (
    <Modal open={open} onClose={onClose} title="Manhole Details" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase">QR Code ID</p>
            <p className="font-medium font-mono text-text-primary">{manhole.qrCodeId}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Area</p>
            <p className="font-medium text-text-primary">{manhole.area}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Address</p>
            <p className="font-medium text-text-primary">{manhole.address ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Risk Score</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-heading font-bold text-text-primary">{manhole.riskScore ?? 0}</span>
              <RiskBadge level={riskLevel(manhole.riskScore ?? 0)} />
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Depth / Diameter</p>
            <p className="font-medium text-text-primary">{manhole.depth ?? '---'}m / {manhole.diameter ?? '---'}m</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Max Workers</p>
            <p className="font-medium text-text-primary">{manhole.maxWorkers ?? '---'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Gas Sensor</p>
            <p className="font-medium text-text-primary">{manhole.hasGasSensor ? 'Installed' : 'Not installed'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Geo-fence Radius</p>
            <p className="font-medium text-text-primary">{manhole.geoFenceRadius ?? 50}m</p>
          </div>
        </div>

        {manhole.recentEntries && manhole.recentEntries.length > 0 && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">Recent Entries</h3>
            <ul className="space-y-1 text-sm text-text-secondary">
              {manhole.recentEntries.slice(0, 5).map((e: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{e.worker?.name ?? 'Unknown'}</span>
                  <span className="text-text-muted">{new Date(e.entryTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {manhole.gasReadings && manhole.gasReadings.length > 0 && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">Latest Gas Readings</h3>
            <div className="grid grid-cols-3 gap-2">
              {manhole.gasReadings.slice(0, 6).map((r: any, i: number) => (
                <div key={i} className={`p-2 rounded text-center text-sm ${r.danger ? 'bg-danger-muted text-danger' : 'bg-safe-muted text-safe'}`}>
                  <p className="font-medium">{r.gas}</p>
                  <p className="text-xs">{r.value} {r.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
