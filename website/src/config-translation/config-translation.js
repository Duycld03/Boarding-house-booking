import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_menu from '@/locales/en/menu.json';
import en_sidebar from '@/locales/en/sidebar.json';
import vi_menu from '@/locales/vi/menu.json';
import vi_sidebar from '@/locales/vi/sidebar.json';
import en_home from '@/locales/en/home.json';
import vi_home from '@/locales/vi/home.json';
import en_changePassword from '@/locales/en/changePassword.json';
import vi_changePassword from '@/locales/vi/changePassword.json';
import en_contact from '@/locales/en/contact.json';
import vi_contact from '@/locales/vi/contact.json';
import vi_profile from '@/locales/vi/profile.json';
import en_profile from '@/locales/en/profile.json';
import vi_aboutUs from '@/locales/vi/aboutUs.json';
import en_aboutUs from '@/locales/en/aboutUs.json';
i18n.use(initReactI18next).init({
  resources: {
    en: {
      menu: en_menu,
      sidebar: en_sidebar,
      home: en_home,
      changePassword: en_changePassword,
      contact: en_contact,
      profile: en_profile,
      aboutUs: en_aboutUs,
    },
    vi: {
      menu: vi_menu,
      sidebar: vi_sidebar,
      home: vi_home,
      changePassword: vi_changePassword,
      contact: vi_contact,
      profile: vi_profile,
      aboutUs: vi_aboutUs,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['menu', 'sidebar', 'home', 'changePassword', 'aboutUs'],
  defaultNS: 'menu',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
