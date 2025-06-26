import { AuthLayout, HeaderOnly, ProfileLayout } from "../Layouts";

// Namespace imports
import * as AuthPages from "../pages/auth";
import * as CommonPages from "../pages/common";
import * as DashboardPages from "../pages/dashboard";

const DASHBOARD_PATH = "/dashboard";

const routes = [
  // Auth routes
  {
    path: "/",
    page: AuthPages.Login,
    layout: AuthLayout,
  },
  {
    path: "/register",
    page: AuthPages.Register,
    layout: AuthLayout,
  },
  {
    path: "/register-with-google",
    page: AuthPages.RegisterWithGoogle,
    layout: AuthLayout,
  },
  {
    path: "/verify-register",
    page: AuthPages.VerifyRegister,
    layout: AuthLayout,
  },
  {
    path: "/forgot-password",
    page: AuthPages.ForgotPassword,
    layout: AuthLayout,
  },
  {
    path: "/reset-password/:token",
    page: AuthPages.ResetPassword,
    layout: AuthLayout,
  },
  {
    path: "/change-password",
    page: AuthPages.ChangePassword,
    layout: AuthLayout,
  },
  {
    path: "/verify-change-email/",
    page: AuthPages.VerifyChangeEmail,
    layout: AuthLayout,
  },

  // Common routes
  {
    path: "/home",
    label: "Home",
    page: CommonPages.Home,
    layout: HeaderOnly,
  },
  {
    path: "/contact",
    page: CommonPages.Contact,
    layout: HeaderOnly,
  },
  {
    path: "/about-us",
    page: CommonPages.AboutUs,
    layout: HeaderOnly,
  },
  {
    path: "/profile",
    page: CommonPages.Profile,
    layout: ProfileLayout,
  },
  {
    path: "/error-page",
    page: CommonPages.ErrorPage,
    layout: AuthLayout,
  },
  {
    path: "/access-denied",
    page: CommonPages.AccessDeniedPage,
    layout: AuthLayout,
  },
  {
    path: "/my-appointment",
    page: CommonPages.MyAppointment,
    layout: ProfileLayout,
  },
  {
    path: "/favourite-list",
    page: CommonPages.FavouriteList,
    layout: ProfileLayout,
  },
  {
    path: "/watch-later",
    page: CommonPages.WatchLater,
    layout: ProfileLayout,
  },
  {
    path: "/bh-management-owner",
    page: CommonPages.BHManagementOwner,
    layout: ProfileLayout,
  },
  {
    path: "/bh-management-owner/:boardingHouseId",
    page: CommonPages.BHDetailOwner,
    layout: ProfileLayout,
  },
  {
    path: "/my-report-management",
    page: CommonPages.MyReportManagement,
    layout: ProfileLayout,
  },
  {
    path: "/my-deposited-room",
    page: CommonPages.MyDepositedRoom,
    layout: ProfileLayout,
  },
  {
    path: "/my-renewal-request",
    page: CommonPages.MyRenewalRequest,
    layout: ProfileLayout,
  },
  {
    path: "/my-rent-payment",
    page: CommonPages.MyRentPayment,
    layout: ProfileLayout,
  },
  {
    path: "/my-deposit-refund-request",
    page: CommonPages.MyDepositRefundRequest,
    layout: ProfileLayout,
  },
  {
    path: "/refund-request-management",
    page: CommonPages.DepositRefundRequestOwner,
    layout: ProfileLayout,
  },
  {
    path: "/revenue-management-owner",
    page: CommonPages.RevenueManagementOwner,
    layout: ProfileLayout,
  },
  {
    path: "/boarding-house/:id",
    page: CommonPages.BoardingHouseDetail,
    layout: HeaderOnly,
  },

  // Dashboard routes
  {
    path: `${DASHBOARD_PATH}/boarding-house-management`,
    page: DashboardPages.BoardingHouseManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/account-management`,
    page: DashboardPages.AccountManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/report-boarding-house-management`,
    page: DashboardPages.ReportBoardingHouse,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/report-review-management`,
    page: DashboardPages.ReportReviewManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/withdrawal-requests-management`,
    page: DashboardPages.WithdrawalRequestManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/list-boarding-house-reviews`,
    page: DashboardPages.ReviewManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/boarding-house-type-management`,
    page: DashboardPages.BoardingHouseTypeManagement,
    layout: null,
  },
  {
    path: `${DASHBOARD_PATH}/facilities-management`,
    page: DashboardPages.FacilitiesManagement,
    layout: null,
  },
];

export default routes;
