import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PPEChecklistProps {
  onComplete: (items: Record<string, boolean>) => void;
  disabled?: boolean;
}

const PPE_ITEMS = [
  { id: 'helmet', label: 'Safety Helmet', icon: 'helmet' },
  { id: 'respirator', label: 'Gas Mask / Respirator', icon: 'mask' },
  { id: 'harness', label: 'Safety Harness', icon: 'harness' },
  { id: 'boots', label: 'Rubber Boots', icon: 'boots' },
  { id: 'gloves', label: 'Gloves', icon: 'gloves' },
  { id: 'vest', label: 'Reflective Vest', icon: 'vest' },
  { id: 'torch', label: 'Torch / Headlamp', icon: 'torch' },
  { id: 'comms', label: 'Communication Device', icon: 'comms' },
] as const;

const TOTAL_ITEMS = PPE_ITEMS.length;

function PPEIcon({ type }: { type: string }) {
  // Simple SVG icons for each PPE type
  switch (type) {
    case 'helmet':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C8 3 4 6 4 10v2h16v-2c0-4-4-7-8-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'mask':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4C8 4 4 7 4 11v1c0 3 2 5 5 6h6c3-1 5-3 5-6v-1c0-4-4-7-8-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 14h8" />
        </svg>
      );
    case 'harness':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M8 6l4-4 4 4M8 10h8M6 14h12M8 18h8" />
        </svg>
      );
    case 'boots':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20h12M7 20V8l2-4h6l2 4v12" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
        </svg>
      );
    case 'gloves':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 13V6a2 2 0 114 0v5m0 0V4a2 2 0 114 0v9m-8 0H5a2 2 0 00-2 2v1a6 6 0 006 6h4a6 6 0 006-6v-3" />
        </svg>
      );
    case 'vest':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L6 5v6c0 5 3 8 6 10 3-2 6-5 6-10V5l-6-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6M9 14h6" />
        </svg>
      );
    case 'torch':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6M12 3v3m0 0a4 4 0 014 4v5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5a4 4 0 014-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l3-1M12 3L9 2" />
        </svg>
      );
    case 'comms':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function PPEChecklist({ onComplete, disabled = false }: PPEChecklistProps) {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PPE_ITEMS.forEach((item) => {
      initial[item.id] = false;
    });
    return initial;
  });

  const completedCount = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems],
  );

  const allChecked = completedCount === TOTAL_ITEMS;
  const progressPercent = (completedCount / TOTAL_ITEMS) * 100;

  const toggleItem = useCallback(
    (itemId: string) => {
      if (disabled) return;

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      setCheckedItems((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    },
    [disabled],
  );

  const handleSubmit = useCallback(() => {
    if (!allChecked || disabled) return;

    // Haptic confirmation
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    onComplete(checkedItems);
  }, [allChecked, disabled, checkedItems, onComplete]);

  // Progress bar color
  const progressColor =
    progressPercent >= 100
      ? 'bg-safe'
      : progressPercent >= 50
        ? 'bg-caution'
        : 'bg-danger';

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-base">
            {t('checklist.title')}
          </h3>
          <span
            className={`text-sm font-bold ${
              allChecked ? 'text-safe' : 'text-text-muted'
            }`}
          >
            {completedCount}/{TOTAL_ITEMS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-text-muted mt-1.5">
          {t('checklist.allRequired')}
        </p>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-border">
        {PPE_ITEMS.map((item) => {
          const isChecked = checkedItems[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-4
                px-4 py-4 min-h-[64px]
                transition-colors duration-150 select-none touch-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isChecked
                  ? 'bg-safe-muted'
                  : 'bg-surface hover:bg-surface-hover active:bg-surface-hover'
                }
              `}
              role="checkbox"
              aria-checked={isChecked}
              aria-label={item.label}
            >
              {/* Checkbox */}
              <div
                className={`
                  flex-shrink-0 flex items-center justify-center
                  w-8 h-8 rounded-lg border-2
                  transition-all duration-150
                  ${isChecked
                    ? 'bg-safe border-safe'
                    : 'bg-transparent border-text-muted'
                  }
                `}
              >
                {isChecked && (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div className={`flex-shrink-0 ${isChecked ? 'text-safe' : 'text-text-muted'}`}>
                <PPEIcon type={item.icon} />
              </div>

              {/* Label */}
              <span
                className={`
                  text-sm font-medium text-left flex-1
                  ${isChecked ? 'text-safe line-through' : 'text-text-primary'}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="px-4 py-4 bg-surface-card border-t border-border">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allChecked || disabled}
          className={`
            w-full py-4 min-h-[56px] rounded-xl
            text-base font-bold
            transition-all duration-150
            select-none touch-none
            ${allChecked && !disabled
              ? 'bg-safe text-white hover:bg-safe active:bg-safe active:scale-[0.98]'
              : 'bg-surface-elevated text-text-muted cursor-not-allowed'
            }
          `}
        >
          {allChecked
            ? t('common.confirm')
            : `${TOTAL_ITEMS - completedCount} items remaining`}
        </button>
      </div>
    </div>
  );
}
