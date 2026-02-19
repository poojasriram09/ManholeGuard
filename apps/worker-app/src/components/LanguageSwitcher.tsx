import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@manholeguard/shared/src/constants/supported-languages';

const STORAGE_KEY = 'mg_language';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
    || SUPPORTED_LANGUAGES[0];

  const handleSelect = useCallback(
    (code: string) => {
      i18n.changeLanguage(code);
      localStorage.setItem(STORAGE_KEY, code);
      setIsOpen(false);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    },
    [i18n],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center gap-2 px-3 py-2.5 min-h-[48px]
          bg-gray-800 border border-gray-600 rounded-lg
          text-gray-200 text-sm font-medium
          hover:bg-gray-700 active:bg-gray-600
          transition-colors duration-150
          select-none touch-none
        "
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Language: ${currentLang.nativeName}`}
      >
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span>{currentLang.nativeName}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-1 w-52 py-1
            bg-gray-800 border border-gray-600 rounded-lg shadow-2xl
            z-50 overflow-hidden
          "
          role="listbox"
          aria-label="Select language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3 min-h-[48px] text-left
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-blue-900/40 text-blue-300'
                    : 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-blue-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
