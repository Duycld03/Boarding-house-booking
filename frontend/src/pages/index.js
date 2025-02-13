import {
  Login,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  VerifyChangeEmail,
} from './auth';
import {
  AboutUs,
  Home,
  Contact,
  Profile,
  ErrorPage,
  BoardingHouseDetail,
  MyAppointment,
  BHManagementOwner,
} from './common';

import {
  BoardingHouseManagement,
  ReportReviewManagement,
  ReportBoardingHouse,
  WithdrawalRequestManagement,
  AccountManagement,
  ReviewManagement,
} from './dashboard';

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
  BHManagementOwner,

  // owner

  //dashboard
  BoardingHouseManagement,
  AccountManagement,
  ReportBoardingHouse,
  ReportReviewManagement,
  WithdrawalRequestManagement,
  ReviewManagement,
};
