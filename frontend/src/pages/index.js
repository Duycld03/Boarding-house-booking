import {
  Login,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  VerifyChangeEmail,
} from "./auth";
import {
  AboutUs,
  Home,
  Contact,
  Profile,
  ErrorPage,
  BoardingHouseDetail,
  MyAppointment,
  BHManagementOwner,
  BHDetailOwner,
  WatchLater,
  MyReportManagement,
  MyDepositedRoom,
  MyRentPayment
  MyDepositRefundRequest,
  DepositRefundRequestOwner,
} from "./common";

import {
  BoardingHouseManagement,
  ReportReviewManagement,
  ReportBoardingHouse,
  WithdrawalRequestManagement,
  AccountManagement,
  ReviewManagement,
  BoardingHouseTypeManagement,
  FacilitiesManagement,
} from "./dashboard";

export {
  //auth
  Login,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  BoardingHouseDetail,
  VerifyChangeEmail,

  //common
  AboutUs,
  Contact,
  Home,
  Profile,
  ErrorPage,
  MyAppointment,
  WatchLater,
  MyReportManagement,
  MyDepositedRoom,
  MyRentPayment,
  MyDepositRefundRequest,

  // owner
  BHManagementOwner,
  BHDetailOwner,
  DepositRefundRequestOwner,

  //dashboard
  BoardingHouseManagement,
  AccountManagement,
  ReportBoardingHouse,
  ReportReviewManagement,
  WithdrawalRequestManagement,
  ReviewManagement,
  BoardingHouseTypeManagement,
  FacilitiesManagement,
};
