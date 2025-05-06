import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '@/locales/en/translation';
import translationVI from '@/locales/vi/translation';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    vi: { translation: translationVI },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; // ✅ Export đúng instance đã config
