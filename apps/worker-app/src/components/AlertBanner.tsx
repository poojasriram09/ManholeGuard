import { useState, useEffect, useCallback } from 'react';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  onDismiss?: () => void;
  persistent?: boolean;
}

const TYPE_CONFIG = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    icon: (
      <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    dismissBtn: 'text-blue-500 active:text-blue-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: (
      <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 9v4M12 17h.01M10.29 3.86l-8.6 14.86A2 2 0 003.44 22h17.12a2 2 0 001.75-3.28l-8.6-14.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    dismissBtn: 'text-yellow-600 active:text-yellow-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: (
      <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    dismissBtn: 'text-red-500 active:text-red-700',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: (
      <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    dismissBtn: 'text-green-500 active:text-green-700',
  },
} as const;

export default function AlertBanner({ type, message, onDismiss, persistent = false }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (persistent) return;

    const timer = setTimeout(() => {
      dismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [persistent, dismiss]);

  if (!visible) return null;

  const config = TYPE_CONFIG[type];

  return (
    <div
      role="alert"
      className={`
        ${config.bg} ${config.border} border-2 rounded-2xl p-4
        flex items-start gap-3
        transition-all duration-300 ease-out
        ${exiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0 animate-banner-in'}
      `}
    >
      {config.icon}

      <p className={`${config.text} text-sm font-medium flex-1 pt-0.5`}>
        {message}
      </p>

      {onDismiss && (
        <button
          type="button"
          onClick={dismiss}
          className={`${config.dismissBtn} p-2 -m-1 rounded-xl flex-shrink-0`}
          aria-label="Dismiss alert"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <style>{`
        @keyframes banner-in {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-banner-in {
          animation: banner-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
