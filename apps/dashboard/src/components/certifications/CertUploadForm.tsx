import { useState } from 'react';

interface CertUploadFormProps {
  workerId: string;
  onSubmit: (data: {
    workerId: string;
    type: string;
    certificateNumber: string;
    issuedAt: string;
    expiresAt: string;
    issuedBy: string;
    documentUrl: string;
  }) => void;
  onCancel: () => void;
}

const certTypes = [
  'SAFETY_TRAINING',
  'CONFINED_SPACE',
  'FIRST_AID',
  'GAS_DETECTION',
  'PPE_USAGE',
  'MEDICAL_FITNESS',
];

export default function CertUploadForm({ workerId, onSubmit, onCancel }: CertUploadFormProps) {
  const [type, setType] = useState('SAFETY_TRAINING');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ workerId, type, certificateNumber, issuedAt, expiresAt, issuedBy, documentUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Certification Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="input-dark w-full">
          {certTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Certificate Number</label>
        <input type="text" value={certificateNumber} onChange={(e) => setCertificateNumber(e.target.value)}
          required placeholder="e.g. CERT-2026-001"
          className="input-dark w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Issued Date</label>
          <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)}
            required className="input-dark w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Expires Date</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            required className="input-dark w-full" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Issued By</label>
        <input type="text" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)}
          required placeholder="Issuing authority"
          className="input-dark w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Document URL</label>
        <input type="url" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)}
          placeholder="https://..."
          className="input-dark w-full" />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Upload Certification
        </button>
      </div>
    </form>
  );
}
