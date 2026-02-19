interface CertificationTableProps {
  certifications: any[];
}

export default function CertificationTable({ certifications }: CertificationTableProps) {
  if (!certifications || certifications.length === 0) {
    return <p className="text-sm text-text-muted text-center py-4">No certifications on file</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-elevated">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Number</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Issued</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Expiry</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {certifications.map((cert, i) => {
            const expired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
            return (
              <tr key={i} className={expired ? 'bg-danger-muted/30' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{cert.type}</td>
                <td className="px-4 py-3 text-sm font-mono text-text-secondary">{cert.number}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : '---'}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : '---'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    expired ? 'bg-danger-muted text-danger border border-danger/20' : 'bg-safe-muted text-safe border border-safe/20'
                  }`}>
                    {expired ? 'Expired' : 'Valid'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
