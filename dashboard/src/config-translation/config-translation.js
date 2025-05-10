import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_menu from '@/locales/en/menu.json';
import vi_menu from '@/locales/vi/menu.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      menu: en_menu,
    },
    vi: {
      menu: vi_menu,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['menu'],
  defaultNS: 'menu',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
