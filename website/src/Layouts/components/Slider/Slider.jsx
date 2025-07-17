import { Layout, Menu } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faClipboardList,
  faCalendarCheck,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../../context/themeContext";

const { Sider } = Layout;

const CustomSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation("dashboard"); // Đảm bảo có namespace "dashboard" trong i18n
  const { darkMode } = useTheme();

  const dashBoard = "/dashboard";

  // Tạo danh sách menu items với hỗ trợ đa ngôn ngữ
  const menuItems = [
    {
      key: "account-management",
      label: (
        <Link to={dashBoard + "/account-management"}>
          {t("menu.accountManagement")}
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      key: "Report-management",
      label: t("menu.reportManagement"),
      icon: <FileDoneOutlined />,
      children: [
        {
          key: "report-review-management",
          label: (
            <Link to={dashBoard + "/report-review-management"}>
              {t("menu.reportReview")}
            </Link>
          ),
          icon: <FileTextOutlined />,
        },
        {
          key: "report-boarding-house-management",
          label: (
            <Link to={dashBoard + "/report-boarding-house-management"}>
              {t("menu.reportBoardingHouse")}
            </Link>
          ),
          icon: <FontAwesomeIcon icon={faClipboardList} />,
        },
      ],
    },
    {
      key: "boarding-house-management",
      label: (
        <Link to={dashBoard + "/boarding-house-management"}>
          {t("menu.boardingHouseManagement")}
        </Link>
      ),
      icon: <HomeOutlined />,
    },
    {
      key: "boarding-house-type-management",
      label: (
        <Link to={dashBoard + "/boarding-house-type-management"}>
          {t("menu.boardingHouseTypeManagement")}
        </Link>
      ),
      icon: <HomeOutlined />,
    },
    {
      key: "withdrawal-requests-management",
      label: (
        <Link to={dashBoard + "/withdrawal-requests-management"}>
          {t("menu.withdrawalRequests")}
        </Link>
      ),
      icon: <FontAwesomeIcon icon={faCreditCard} />,
    },
    {
      key: "list-boarding-house-reviews",
      label: (
        <Link to={dashBoard + "/list-boarding-house-reviews"}>
          {t("menu.reviewManagement")}
        </Link>
      ),
      icon: <FontAwesomeIcon icon={faCalendarCheck} />,
    },
    {
      key: "Facilities-management",
      label: (
        <Link to={dashBoard + "/Facilities-management"}>
          {t("menu.facilitiesManagement")}
        </Link>
      ),
      icon: <FontAwesomeIcon icon={faTools} />,
    },
  ];

  // Define theme-based styles
  const themeStyles = {
    background: darkMode ? "#141414" : "#fff",
    borderRight: darkMode ? "1px solid #303030" : "1px solid #f0f0f0",
  };

  return (
    <Sider
      width={width}
      collapsible
      collapsed={collapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      className={`lg:block hidden transition-colors duration-300 ${
        darkMode ? "dark-theme" : "light-theme"
      }`}
      style={themeStyles}
      {...props}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        style={{ height: "100%" }}
        items={menuItems}
        theme={darkMode ? "dark" : "light"}
      />
    </Sider>
  );
};

export default CustomSlider;
