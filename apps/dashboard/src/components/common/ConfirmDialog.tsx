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
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-lg text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
