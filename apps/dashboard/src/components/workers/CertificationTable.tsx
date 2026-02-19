interface CertificationTableProps {
  certifications: any[];
}

export default function CertificationTable({ certifications }: CertificationTableProps) {
  if (!certifications || certifications.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No certifications on file</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {certifications.map((cert, i) => {
            const expired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
            return (
              <tr key={i} className={expired ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-sm font-medium">{cert.type}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{cert.number}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : '---'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : '---'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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
