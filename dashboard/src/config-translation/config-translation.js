import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_menu from '@/locales/en/menu.json';
import vi_menu from '@/locales/vi/menu.json';
import en_accountManagement from '@/locales/en/accountManagement.json';
import vi_accountManagement from '@/locales/vi/accountManagement.json';
import en_changePassword from '@/locales/en/changePassword.json';
import vi_changePassword from '@/locales/vi/changePassword.json';
import en_reviewReportManagement from '@/locales/en/reviewReportManagement.json';
import vi_reviewReportManagement from '@/locales/vi/reviewReportManagement.json';
import en_reviewManagement from '@/locales/en/reviewManagement.json';
import vi_reviewManagement from '@/locales/vi/reviewManagement.json';
import en_reportBoardingHouse from '@/locales/en/reportBoardingHouse.json';
import vi_reportBoardingHouse from '@/locales/vi/reportBoardingHouse.json';
import en_common from '@/locales/en/common.json';
import vi_common from '@/locales/vi/common.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      menu: en_menu,
      accountManagement: en_accountManagement,
      changePassword: en_changePassword,
      reviewReportManagement: en_reviewReportManagement,
      reviewManagement: en_reviewManagement,
      reportBoardingHouse: en_reportBoardingHouse,
      common: en_common,
    },
    vi: {
      menu: vi_menu,
      accountManagement: vi_accountManagement,
      changePassword: vi_changePassword,
      reviewReportManagement: vi_reviewReportManagement,
      reviewManagement: vi_reviewManagement,
      reportBoardingHouse: vi_reportBoardingHouse,
      common: vi_common,
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
