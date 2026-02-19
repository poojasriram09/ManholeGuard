import Badge from '../common/Badge';

interface Certification {
  id: string;
  type: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string;
  issuedBy?: string;
}

interface WorkerCertTableProps {
  certifications: Certification[];
  onDelete?: (id: string) => void;
}

function isValid(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() > Date.now();
}

function isExpiringSoon(expiresAt: string): boolean {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

export default function WorkerCertTable({ certifications, onDelete }: WorkerCertTableProps) {
  if (certifications.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No certifications found.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Certificate No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
              {onDelete && <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {certifications.map((cert) => {
              const valid = isValid(cert.expiresAt);
              const expiring = isExpiringSoon(cert.expiresAt);
              return (
                <tr key={cert.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{cert.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm font-mono text-text-secondary">{cert.certificateNumber}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{new Date(cert.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {!valid ? (
                      <Badge variant="danger">Expired</Badge>
                    ) : expiring ? (
                      <Badge variant="warning">Expiring Soon</Badge>
                    ) : (
                      <Badge variant="success">Valid</Badge>
                    )}
                  </td>
                  {onDelete && (
                    <td className="px-4 py-3">
                      <button onClick={() => onDelete(cert.id)}
                        className="text-danger hover:text-danger/80 text-sm font-medium transition-colors">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
