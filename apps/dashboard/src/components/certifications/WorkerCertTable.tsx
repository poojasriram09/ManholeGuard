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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No certifications found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {onDelete && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {certifications.map((cert) => {
              const valid = isValid(cert.expiresAt);
              const expiring = isExpiringSoon(cert.expiresAt);
              return (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{cert.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cert.certificateNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(cert.expiresAt).toLocaleDateString()}</td>
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
                        className="text-red-600 hover:text-red-800 text-sm font-medium">
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
