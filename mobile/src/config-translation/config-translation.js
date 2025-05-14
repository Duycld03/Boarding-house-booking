import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';
import en_setting from '@/locales/en/setting.json';
import vi_setting from '@/locales/vi/setting.json';
import en_account from '@/locales/en/account.json';
import vi_account from '@/locales/vi/account.json';
import en_changePassword from '@/locales/en/changePassword.json';
import vi_changePassword from '@/locales/vi/changePassword.json';
import en_profile from '@/locales/en/profile.json';
import vi_profile from '@/locales/vi/profile.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      setting: en_setting,
      account: en_account,
      changePassword: en_changePassword,
      profile: en_profile,
    },
    vi: {
      setting: vi_setting,
      account: vi_account,
      changePassword: vi_changePassword,
      profile: vi_profile,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['setting', 'account'],
  defaultNS: 'setting',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
