import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@manholeguard/shared/src/i18n/en.json';
import hi from '@manholeguard/shared/src/i18n/hi.json';
import mr from '@manholeguard/shared/src/i18n/mr.json';
import ta from '@manholeguard/shared/src/i18n/ta.json';
import te from '@manholeguard/shared/src/i18n/te.json';
import kn from '@manholeguard/shared/src/i18n/kn.json';

const savedLanguage = localStorage.getItem('dashboard_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
