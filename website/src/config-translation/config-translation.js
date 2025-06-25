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
import en_bhDetail from '@/locales/en/bhDetail.json';
import vi_bhDetail from '@/locales/vi/bhDetail.json';
import en_bhManagement from '@/locales/en/bhManagement';
import vi_bhManagement from '@/locales/vi/bhManagement';
import en_common from '@/locales/en/common.json';
import vi_common from '@/locales/vi/common.json';
import en_reportModal from '@/locales/en/reportModal.json';
import vi_reportModal from '@/locales/vi/reportModal.json';
import en_depositPopup from '@/locales/en/depositPopup.json';
import vi_depositPopup from '@/locales/vi/depositPopup.json';
import en_myreport from '@/locales/en/myreport.json';
import vi_myreport from '@/locales/vi/myreport.json';
import en_roomType from '@/locales/en/roomType.json';
import vi_roomType from '@/locales/vi/roomType.json';
import en_depositManagement from '@/locales/en/depositManagement.json';
import vi_depositManagement from '@/locales/vi/depositManagement.json';
import { DepositManagement } from '@/pages/common';

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
      boardingHouseDetail: en_bhDetail,
      bhManagement: en_bhManagement,
      common: en_common,
      reportModal: en_reportModal,
      depositPopup: en_depositPopup,
      myreport: en_myreport,
      roomType: en_roomType,
      depositManagement: en_depositManagement,
    },
    vi: {
      menu: vi_menu,
      sidebar: vi_sidebar,
      home: vi_home,
      changePassword: vi_changePassword,
      contact: vi_contact,
      profile: vi_profile,
      aboutUs: vi_aboutUs,
      boardingHouseDetail: vi_bhDetail,
      bhManagement: vi_bhManagement,
      common: vi_common,
      reportModal: vi_reportModal,
      depositPopup: vi_depositPopup,
      myreport: vi_myreport,
      roomType: vi_roomType,
      depositManagement: vi_depositManagement,
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
