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
import vi_boardingHouseDetailsAdmin from '@/locales/vi/boardingHouseDetailsAdmin.json';
import en_boardingHouseDetailsAdmin from '@/locales/en/boardingHouseDetailsAdmin.json';
import vi_addBoardingHouseAdmin from '@/locales/vi/addBoardingHouseAdmin.json';
import en_addBoardingHouseAdmin from '@/locales/en/addBoardingHouseAdmin.json';
import vi_boardingHouseAdmin from '@/locales/vi/boardingHouseAdmin.json';
import en_boardingHouseAdmin from '@/locales/en/boardingHouseAdmin.json';
import en_profile from "@/locales/en/profile.json";
import vi_profile from "@/locales/vi/profile.json";
import en_filterBH from "@/locales/en/filterBH.json";
import vi_filterBH from "@/locales/vi/filterBH.json";

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
      boardingHouseDetailsAdmin: en_boardingHouseDetailsAdmin,
      addBoardingHouseAdmin: en_addBoardingHouseAdmin,
      boardingHouseAdmin: en_boardingHouseAdmin,
      profile: en_profile,
      filterBH: en_filterBH,
    },
    vi: {
      menu: vi_menu,
      accountManagement: vi_accountManagement,
      changePassword: vi_changePassword,
      reviewReportManagement: vi_reviewReportManagement,
      reviewManagement: vi_reviewManagement,
      reportBoardingHouse: vi_reportBoardingHouse,
      common: vi_common,
      boardingHouseDetailsAdmin: vi_boardingHouseDetailsAdmin,
      addBoardingHouseAdmin: vi_addBoardingHouseAdmin,
      boardingHouseAdmin: vi_boardingHouseAdmin,
      profile: vi_profile,
      filterBH: vi_filterBH
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['menu', 'boardingHouseDetailsAdmin', 'addBoardingHouseAdmin', 'boardingHouseAdmin', 'filterBH'],
  defaultNS: 'menu',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
