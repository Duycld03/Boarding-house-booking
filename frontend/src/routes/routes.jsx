import {
  Login,
  Home,
  BoardingHouseManagement,
  AccountManagement,
  ReportBoardingHouse,
  ReportReviewManagement,
  WithdrawalRequestManagement,
  Contact,
  AboutUs,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
} from "../pages";
import { AuthLayout, HeaderOnly } from "../Layouts";

const dashBoard = "/dashboard";

const routes = [
  //auth
  {
    path: "/login",
    page: Login,
    layout: AuthLayout,
  },

  {
    path: "/register",
    page: Register,
    layout: AuthLayout,
  },
  {
    path: "/register-with-google",
    page: RegisterWithGoogle,
    layout: AuthLayout,
  },
  {
    path: "/verify-register",
    page: VerifyRegister,
    layout: AuthLayout,
  },

  //common
  {
    path: "/",
    label: "Home",
    page: Home,
    layout: HeaderOnly,
  },
  {
    path: "/contact",
    page: Contact,
    layout: HeaderOnly,
  },
  {
    path: "about-us",
    page: AboutUs,
    layout: HeaderOnly,
  },

  // dashBoard
  {
    path: `${dashBoard}/boarding-house-management`,
    page: BoardingHouseManagement,
    layout: null,
  },
  {
    path: `${dashBoard}/account-management`,
    page: AccountManagement,
    layout: null,
  },
  {
    path: `${dashBoard}/report-boarding-house-management`,
    page: ReportBoardingHouse,
    layout: null,
  },
  {
    path: `${dashBoard}/report-review-management`,
    page: ReportReviewManagement,
    layout: null,
  },
  {
    path: `${dashBoard}/withdrawal-requests-management`,
    page: WithdrawalRequestManagement,
    layout: null,
  },
];

export default routes;
