import {
  Login,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
} from "./auth";
import { AboutUs, Home, Contact, Profile } from "./common";

import {
  BoardingHouseManagement,
  ReportReviewManagement,
  ReportBoardingHouse,
  WithdrawalRequestManagement,
  AccountManagement,
  ReviewManagement,
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

  //common
  AboutUs,
  Contact,
  Home,
  Profile,

  // owner

  //dashboard
  BoardingHouseManagement,
  AccountManagement,
  ReportBoardingHouse,
  ReportReviewManagement,
  WithdrawalRequestManagement,
  ReviewManagement,
};
