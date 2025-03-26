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
  ReviewManagement,
  Register,
  RegisterWithGoogle,
  VerifyRegister,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  Profile,
  BoardingHouseDetail,
  VerifyChangeEmail,
  ErrorPage,
  MyAppointment,
  WatchLater,
  FacilitiesManagement,
  MyReportManagement,
  BoardingHouseTypeManagement,
  MyDepositedRoom,
  MyRenewalRequest,
  MyRentPayment,
  MyDepositRefundRequest,
} from "../pages";
import { AuthLayout, HeaderOnly, ProfileLayout } from "../Layouts";
import {
  BHManagementOwner,
  BHDetailOwner,
  FavouriteList,
  DepositRefundRequestOwner,
  RevenueManagementOwner,
} from "../pages/common";

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
  {
    path: "/forgot-password",
    page: ForgotPassword,
    layout: AuthLayout,
  },
  {
    path: "/reset-password/:token",
    page: ResetPassword,
    layout: AuthLayout,
  },
  {
    path: "/change-password",
    page: ChangePassword,
    layout: AuthLayout,
  },
  {
    path: "/verify-change-email/",
    page: VerifyChangeEmail,
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
  {
    path: "profile",
    page: Profile,
    layout: ProfileLayout,
  },
  {
    path: "/error-page",
    page: ErrorPage,
    layout: AuthLayout,
  },

  {
    path: "/my-appointment",
    page: MyAppointment,
    layout: ProfileLayout,
  },
  {
    path: "/favourite-list",
    page: FavouriteList,
    layout: ProfileLayout,
  },
  {
    path: "/watch-later",
    page: WatchLater,
    layout: ProfileLayout,
  },
  {
    path: "/bh-management-owner",
    page: BHManagementOwner,
    layout: ProfileLayout,
  },
  {
    path: "/bh-management-owner/:boardingHouseId",
    page: BHDetailOwner,
    layout: ProfileLayout,
  },
  {
    path: "/my-report-management",
    page: MyReportManagement,
    layout: ProfileLayout,
  },
  {
    path: "/my-deposited-room",
    page: MyDepositedRoom,
    layout: ProfileLayout,
  },
  {
    path: "/my-renewal-request",
    page: MyRenewalRequest,
    layout: ProfileLayout,
  },
  {
    path: "/my-rent-payment",
    page: MyRentPayment,
    layout: ProfileLayout,
  },
  {
    path: "/my-deposit-refund-request",
    page: MyDepositRefundRequest,
    layout: ProfileLayout,
  },
  {
    path: "/refund-request-management",
    page: DepositRefundRequestOwner,
    layout: ProfileLayout,
  },
  {
    path: "/revenue-management-owner",
    page: RevenueManagementOwner,
    layout: ProfileLayout,
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

  {
    path: `${dashBoard}/list-boarding-house-reviews`,
    page: ReviewManagement,
    layout: null,
  },
  {
    path: "/boarding-house/:id",
    page: BoardingHouseDetail,
    layout: HeaderOnly,
  },
  {
    path: `${dashBoard}/boarding-house-type-management`,
    page: BoardingHouseTypeManagement,
    layout: null,
  },
  {
    path: `${dashBoard}/facilities-management`,
    page: FacilitiesManagement,
    layout: null,
  },
];

export default routes;
