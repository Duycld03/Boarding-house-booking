import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faClipboardList,
  faCalendarCheck,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const dashBoard = "/dashboard";

const menuItems = [
  {
    key: "account-management",
    label: (
      <Link to={dashBoard + "/account-management"}>Account Management</Link>
    ),
    icon: <UserOutlined />,
  },
  {
    key: "Report-management",
    label: "Report Management",
    icon: <FileDoneOutlined />,
    children: [
      {
        key: "report-review-management",
        label: (
          <Link to={dashBoard + "/report-review-management"}>
            Report Review
          </Link>
        ),
        icon: <FileTextOutlined />,
      },
      {
        key: "report-boarding-house-management",
        label: (
          <Link to={dashBoard + "/report-boarding-house-management"}>
            Report Boarding House
          </Link>
        ),
        icon: <FontAwesomeIcon icon={faClipboardList} />, // Dùng icon ClipboardList cho báo cáo nhà trọ
      },
    ],
  },
  {
    key: "boarding-house-management",
    label: (
      <Link to={dashBoard + "/boarding-house-management"}>
        Boarding house Management
      </Link>
    ),
    icon: <HomeOutlined />,
  },
  // {
  //   key: "boarding-house-type-management",
  //   label: (
  //     <Link to={dashBoard + "/boarding-house-type-management"}>
  //       Boarding House Type Management
  //     </Link>
  //   ),
  //   icon: <HomeOutlined />,
  // },

  {
    key: "list-boarding-house-reviews",
    label: (
      <Link to={dashBoard + "/list-boarding-house-reviews"}>
        Review Management
      </Link>
    ),
    icon: <FontAwesomeIcon icon={faCalendarCheck} />,
  },
  // {
  //   key: "Facilities-management",
  //   label: (
  //     <Link to={dashBoard + "/Facilities-management"}>
  //       Facilities Management
  //     </Link>
  //   ),
  //   icon: <FontAwesomeIcon icon={faTools} />,
  // },
];

export default menuItems;
