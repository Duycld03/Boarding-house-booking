import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "intl-pluralrules";
import en_setting from "@/locales/en/setting.json";
import vi_setting from "@/locales/vi/setting.json";
import en_account from "@/locales/en/account.json";
import vi_account from "@/locales/vi/account.json";
import en_changePassword from "@/locales/en/changePassword.json";
import vi_changePassword from "@/locales/vi/changePassword.json";
import en_profile from "@/locales/en/profile.json";
import vi_profile from "@/locales/vi/profile.json";
import en_feedbackComponent from "@/locales/en/feedbackComponent.json";
import vi_feedbackComponent from "@/locales/vi/feedbackComponent.json";
import en_login from "@/locales/en/login.json";
import vi_login from "@/locales/vi/login.json";
import en_register from "@/locales/en/register.json";
import vi_register from "@/locales/vi/register.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      setting: en_setting,
      account: en_account,
      changePassword: en_changePassword,
      profile: en_profile,
      feedbackComponent: en_feedbackComponent,
      login: en_login,
      register: en_register,
    },
    vi: {
      setting: vi_setting,
      account: vi_account,
      changePassword: vi_changePassword,
      profile: vi_profile,
      feedbackComponent: vi_feedbackComponent,
      login: vi_login,
      register: vi_register,
    },
  },
  lng: "en",
  fallbackLng: "en",
  ns: ["setting", "account"],
  defaultNS: "setting",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
