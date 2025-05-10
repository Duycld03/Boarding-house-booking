import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';
import en_setting from '@/locales/en/setting.json';
import vi_setting from '@/locales/vi/setting.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      setting: en_setting,
    },
    vi: {
      setting: vi_setting,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['setting'],
  defaultNS: 'setting',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
