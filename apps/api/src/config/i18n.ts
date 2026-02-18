import i18next from 'i18next';
import en from '@manholeguard/shared/src/i18n/en.json';
import hi from '@manholeguard/shared/src/i18n/hi.json';

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
});

export default i18next;

export function t(key: string, lng: string = 'en', options?: Record<string, unknown>): string {
  return i18next.t(key, { lng, ...options });
}
