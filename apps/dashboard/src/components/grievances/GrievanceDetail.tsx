import { useState } from 'react';
import Badge from '../common/Badge';

interface GrievanceDetailProps {
  grievance: {
    id: string;
    subject?: string;
    description?: string;
    status: string;
    createdAt: string;
    citizenName?: string;
    citizenPhone?: string;
    category?: string;
    manholeId?: string;
    location?: string;
    imageUrl?: string;
    resolvedAt?: string;
    notes?: string;
  };
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}

const statusVariant: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  OPEN: 'danger',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export default function GrievanceDetail({ grievance, onUpdateStatus }: GrievanceDetailProps) {
  const [newStatus, setNewStatus] = useState(grievance.status);
  const [notes, setNotes] = useState('');

  const handleUpdate = () => {
    onUpdateStatus(grievance.id, newStatus, notes || undefined);
    setNotes('');
  };

  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-heading font-bold text-text-primary">{grievance.subject || 'Grievance'}</h2>
          <p className="text-xs text-text-muted mt-1">ID: {grievance.id}</p>
        </div>
        <Badge variant={statusVariant[grievance.status] || 'default'}>{grievance.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-text-muted uppercase">Reported By</p>
          <p className="font-medium text-text-primary">{grievance.citizenName || 'Anonymous'}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase">Date</p>
          <p className="font-medium text-text-primary">{new Date(grievance.createdAt).toLocaleString()}</p>
        </div>
        {grievance.citizenPhone && (
          <div>
            <p className="text-xs text-text-muted uppercase">Phone</p>
            <p className="font-medium text-text-primary">{grievance.citizenPhone}</p>
          </div>
        )}
        {grievance.category && (
          <div>
            <p className="text-xs text-text-muted uppercase">Category</p>
            <p className="font-medium text-text-primary">{grievance.category}</p>
          </div>
        )}
        {grievance.location && (
          <div>
            <p className="text-xs text-text-muted uppercase">Location</p>
            <p className="font-medium text-text-primary">{grievance.location}</p>
          </div>
        )}
        {grievance.manholeId && (
          <div>
            <p className="text-xs text-text-muted uppercase">Manhole</p>
            <p className="font-medium text-text-primary">{grievance.manholeId}</p>
          </div>
        )}
      </div>

      {grievance.description && (
        <div>
          <p className="text-xs text-text-muted uppercase mb-1">Description</p>
          <p className="text-sm text-text-secondary bg-surface-elevated rounded-lg p-3">{grievance.description}</p>
        </div>
      )}

      <div className="border-t border-border pt-4 space-y-3">
        <h3 className="text-sm font-heading font-semibold text-text-primary">Update Status</h3>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
          className="input-dark w-full">
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          placeholder="Add notes (optional)..."
          className="input-dark w-full" />
        <button onClick={handleUpdate} className="btn-primary">
          Update Status
        </button>
      </div>
    </div>
  );
}
