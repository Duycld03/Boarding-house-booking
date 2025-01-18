import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faClipboardList,
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
  {
    key: "withdrawal-requests-management",
    label: (
      <Link to={dashBoard + "/withdrawal-requests-management"}>
        Withdrawal Requests
      </Link>
    ),
    icon: <FontAwesomeIcon icon={faCreditCard} />,
  },
];

export default menuItems;
