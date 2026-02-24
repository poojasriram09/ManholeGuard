import { useTranslation } from 'react-i18next';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline, pendingCount, syncing } = useOfflineSync();

  // Determine display state
  const showPendingBadge = pendingCount > 0;

  return (
    <div
      className={`
        sticky top-0 z-40 flex items-center justify-between
        px-4 py-2 text-sm font-medium transition-colors duration-300
        ${isOnline
          ? 'bg-surface text-text-secondary'
          : 'bg-danger-muted text-danger'
        }
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {/* Status dot */}
        <span
          className={`
            inline-block w-2.5 h-2.5 rounded-full flex-shrink-0
            ${isOnline ? 'bg-safe' : 'bg-danger animate-pulse'}
          `}
          aria-hidden="true"
        />

        {/* Status text */}
        <span>
          {isOnline
            ? (syncing ? t('offline.syncing') : (pendingCount === 0 ? 'Online' : t('offline.syncPending', { count: pendingCount })))
            : t('offline.indicator')
          }
        </span>
      </div>

      {/* Pending sync badge */}
      {showPendingBadge && (
        <div className="flex items-center gap-1.5">
          {syncing && (
            <div
              className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
              aria-label={t('offline.syncing')}
            />
          )}
          <span
            className={`
              inline-flex items-center justify-center
              min-w-[1.5rem] h-6 px-1.5
              rounded-full text-xs font-bold
              ${isOnline ? 'bg-caution text-white' : 'bg-danger text-text-primary'}
            `}
          >
            {pendingCount}
          </span>
        </div>
      )}
    </div>
  );
}
