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
import en_verifyRegister from "@/locales/en/verifyRegister.json";
import vi_verifyRegister from "@/locales/vi/verifyRegister.json";
import en_verifyChangeEmail from "@/locales/en/verifyChangeEmail.json";
import vi_verifyChangeEmail from "@/locales/vi/verifyChangeEmail.json";
import en_changeEmail from "@/locales/en/changeEmail.json";
import vi_changeEmail from "@/locales/vi/changeEmail.json";
import en_forgotPassword from "@/locales/en/forgotPassword.json";
import vi_forgotPassword from "@/locales/vi/forgotPassword.json";
import en_resetPassword from "@/locales/en/resetPassword.json";
import vi_resetPassword from "@/locales/vi/resetPassword.json";
import en_common from "@/locales/en/common.json";
import vi_common from "@/locales/vi/common.json";
import en_bhDetail from "@/locales/en/bhDetail.json";
import vi_bhDetail from "@/locales/vi/bhDetail.json";
import vi_myAppointment from "@/locales/vi/myAppointment.json";
import en_myAppointment from "@/locales/en/myAppointment.json";
import en_home from "@/locales/en/home.json";
import vi_home from "@/locales/vi/home.json";
import en_depositRoom from "@/locales/en/depositRoom.json";
import vi_depositRoom from "@/locales/vi/depositRoom.json";
import en_report from "@/locales/en/report.json";
import vi_report from "@/locales/vi/report.json";
import en_boardingHouseGallery from "@/locales/en/boardingHouseGallery.json";
import vi_boardingHouseGallery from "@/locales/vi/boardingHouseGallery.json";
import en_myreport from "@/locales/en/myreport.json";
import vi_myreport from "@/locales/vi/myreport.json";
import vi_myRentPayment from "@/locales/vi/myRentPayment.json";
import en_myRentPayment from "@/locales/en/myRentPayment.json";
import en_myDepositedRoom from "@/locales/en/myDepositedRoom.json";
import vi_myDepositedRoom from "@/locales/vi/myDepositedRoom.json";
import en_payRent from "@/locales/en/payRent.json";
import vi_payRent from "@/locales/vi/payRent.json";
import en_payDeposit from "@/locales/en/payDeposit.json";
import vi_payDeposit from "@/locales/vi/payDeposit.json";
import en_review from "@/locales/en/review.json";
import vi_review from "@/locales/vi/review.json";
import vi_RenewalRequest from "@/locales/vi/myRenewalRequest.json";
import en_RenewalRequest from "@/locales/en/myRenewalRequest.json";

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
      verifyRegister: en_verifyRegister,
      verifyChangeEmail: en_verifyChangeEmail,
      changeEmail: en_changeEmail,
      forgotPassword: en_forgotPassword,
      resetPassword: en_resetPassword,
      home: en_home,
      common: en_common,
      boardingHouseDetail: en_bhDetail,
      myAppointment: en_myAppointment,
      depositRoom: en_depositRoom,
      report: en_report,
      boardingHouseGallery: en_boardingHouseGallery,
      review: en_review,
      myreport: en_myreport,
      myRentPayment: en_myRentPayment,
      myDepositedRoom: en_myDepositedRoom,
      payRent: en_payRent,
      payDeposit: en_payDeposit,
      myRenewalRequest: en_RenewalRequest,
    },
    vi: {
      setting: vi_setting,
      account: vi_account,
      changePassword: vi_changePassword,
      profile: vi_profile,
      feedbackComponent: vi_feedbackComponent,
      login: vi_login,
      register: vi_register,
      verifyRegister: vi_verifyRegister,
      verifyChangeEmail: vi_verifyChangeEmail,
      changeEmail: vi_changeEmail,
      forgotPassword: vi_forgotPassword,
      resetPassword: vi_resetPassword,
      home: vi_home,
      common: vi_common,
      boardingHouseDetail: vi_bhDetail,
      myAppointment: vi_myAppointment,
      depositRoom: vi_depositRoom,
      report: vi_report,
      boardingHouseGallery: vi_boardingHouseGallery,
      review: vi_review,
      myreport: vi_myreport,
      myRentPayment: vi_myRentPayment,
      myDepositedRoom: vi_myDepositedRoom,
      payRent: vi_payRent,
      payDeposit: vi_payDeposit,
      myRenewalRequest: vi_RenewalRequest,
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
