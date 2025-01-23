import {
  Login,
  Home,
  BoardingHouseManagement,
  AccountManagement,
  ReportBoardingHouse,
  ReportReviewManagement,
  WithdrawalRequestManagement,
  ContactPage,
  AboutUs,
  ListReviewManagement
} from "../pages";
import { AuthLayout, HeaderOnly } from "../Layouts";

const dashBoard = "/dashboard";

const routes = [
  {
    path: "/login",
    page: Login,
    layout: AuthLayout,
  },
  {
    path: "/",
    label: "Home",
    page: Home,
    layout: HeaderOnly,
  },
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
    path: "/contact",
    page: ContactPage,
    layout: HeaderOnly,
  },
  {
    path: "about-us",
    page: AboutUs,
    layout: HeaderOnly,
  },
  {
    path: `${dashBoard}/list-boarding-house-reviews`,
    page: ListReviewManagement,
    layout: null,
  },
];

export default routes;
