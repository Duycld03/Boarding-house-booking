import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_menu from '@/locales/en/menu.json';
import vi_menu from '@/locales/vi/menu.json';
import en_accountManagement from '@/locales/en/accountManagement.json';
import vi_accountManagement from '@/locales/vi/accountManagement.json';
import en_changePassword from '@/locales/en/changePassword.json';
import vi_changePassword from '@/locales/vi/changePassword.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      menu: en_menu,
      accountManagement: en_accountManagement,
      changePassword: en_changePassword,
    },
    vi: {
      menu: vi_menu,
      accountManagement: vi_accountManagement,
      changePassword: vi_changePassword,
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
