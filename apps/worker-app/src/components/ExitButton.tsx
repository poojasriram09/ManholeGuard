import { useState } from 'react';

interface ExitButtonProps {
  entryId: string;
  onExit: () => void;
}

export default function ExitButton({ entryId, onExit }: ExitButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmExit = () => {
    setShowConfirm(false);
    onExit();
  };

  return (
    <>
      {/* Primary Exit Trigger */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full btn-primary active:bg-accent rounded-2xl py-5 text-xl font-bold shadow-card transition-colors"
        aria-label={`Exit manhole entry ${entryId}`}
      >
        Exit Manhole
      </button>

      {/* Confirmation Dialog Overlay */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl border-t border-border p-6 pb-8 animate-slide-up">
            <div className="w-12 h-1.5 bg-text-muted rounded-full mx-auto mb-6" />

            <h2
              id="exit-confirm-title"
              className="text-xl font-bold text-center mb-2"
            >
              Confirm Exit
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
              Are you sure you want to exit the manhole?
              A health check will follow.
            </p>

            {/* Confirm Exit -- large green button */}
            <button
              type="button"
              onClick={handleConfirmExit}
              className="w-full bg-safe active:bg-safe text-white rounded-2xl py-5 text-xl font-bold shadow-md transition-colors mb-3"
            >
              Confirm Exit
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="w-full bg-surface-elevated active:bg-surface-hover text-text-secondary rounded-2xl py-4 text-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inline style for slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
