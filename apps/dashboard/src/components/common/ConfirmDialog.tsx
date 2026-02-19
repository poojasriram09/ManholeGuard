import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${danger ? 'bg-danger hover:bg-danger/80' : 'bg-accent hover:bg-accent/80'}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
