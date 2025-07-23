import { Layout, Menu } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserOutlined,
  ScheduleOutlined,
  HomeFilled,
  SnippetsOutlined,
  ContainerOutlined,
  HeartOutlined,
  EyeOutlined,
  RollbackOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { useCurrentUser } from "@/context/userContext";
import userRole from "@/constants/userRole";
import { useTheme } from "@/context/ThemeContext";

const { Sider } = Layout;

const CustomProfileSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme();
  const { t } = useTranslation("profile"); // Đảm bảo có namespace "profile" trong i18n
  const { hasRole } = useCurrentUser();

  // Xác định vai trò người dùng
  const isOwner = hasRole(userRole.owner);
  const isUser = hasRole(userRole.user);
  const isStaff = hasRole(userRole.staff);

  // Tạo danh sách menu items với hỗ trợ đa ngôn ngữ
  const menuItemsWithVisibility = [
    {
      key: "profile",
      label: <Link to="/profile">{t("menu.profile")}</Link>,
      icon: <UserOutlined />,
      visible: true, // Ai cũng có quyền xem
    },
    {
      key: "appointment-management",
      label: <Link to="/my-appointment">{t("menu.myAppointment")}</Link>,
      icon: <ScheduleOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: "favourite-list",
      label: <Link to="/favourite-list">{t("menu.myFavourite")}</Link>,
      icon: <HeartOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: "watch-later",
      label: <Link to="/watch-later">{t("menu.watchLater")}</Link>,
      icon: <EyeOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: "bh-management-owner",
      label: (
        <Link to="/bh-management-owner">
          {t("menu.boardingHouseManagement")}
        </Link>
      ),
      icon: <HomeFilled />,
      visible: isOwner || isStaff, // Chỉ Owner và Staff
    },
    {
      key: "deposit-list",
      label: <Link to="/deposit-list">{t("menu.depositManagement")}</Link>,
      icon: <ContainerOutlined />,
      visible: isOwner || isStaff, // Chỉ Owner và Staff
    },
    {
      key: "staff-list",
      label: <Link to="/staff-list">{t("menu.staffManagement")}</Link>,
      icon: <ContainerOutlined />,
      visible: isOwner, // Chỉ Owner
    },
    {
      key: "my-owner-report",
      label: (
        <Link to="/my-report-management">{t("menu.myReportManagement")}</Link>
      ),
      icon: <SnippetsOutlined />,
      visible: isUser,
    },
    {
      key: "my-deposited-room",
      label: <Link to="/my-deposited-room">{t("menu.myDepositedRoom")}</Link>,
      icon: <ContainerOutlined />,
      visible: isUser,
    },
    {
      key: "my-renewal-request",
      label: <Link to="/my-renewal-request">{t("menu.myRenewalRequest")}</Link>,
      icon: <FontAwesomeIcon icon={faEnvelope} />,
      visible: isUser,
    },
    {
      key: "my-rent-room",
      label: <Link to="/my-rent-payment">{t("menu.myRentPayment")}</Link>,
      icon: <FontAwesomeIcon icon={faMoneyBill} />,
      visible: isUser,
    },
    {
      key: "my-deposit-refund-request",
      label: (
        <Link to="/my-deposit-refund-request">
          {t("menu.myDepositRefundRequest")}
        </Link>
      ),
      icon: <RollbackOutlined />,
      visible: isUser,
    },
    {
      key: "refund-request-management",
      label: (
        <Link to="/refund-request-management">
          {t("menu.depositRefundManagement")}
        </Link>
      ),
      icon: <RollbackOutlined />,
      visible: isOwner,
    },
    {
      key: "revenue-management-owner",
      label: (
        <Link to="/revenue-management-owner">
          {t("menu.revenueManagement")}
        </Link>
      ),
      icon: <DollarCircleOutlined />,
      visible: isOwner,
    },
    {
      key: "task-management",
      label: <Link to="/task-management">{t("menu.taskManagement")}</Link>,
      icon: <DollarCircleOutlined />,
      visible: isOwner || isStaff,
    },
    {
      key: "appointment-owner",
      label: <Link to="/appointment-owner">Appointment Management</Link>,
      icon: <DollarCircleOutlined />,
      visible: isOwner || isStaff,
    },
  ];

  // Lọc và loại bỏ thuộc tính visible trước khi render
  const menuItems = menuItemsWithVisibility
    .filter((item) => item.visible)
    .map(({ visible, ...item }) => item); // Loại bỏ thuộc tính visible

  // Define theme-based styles
  const themeStyles = {
    background: darkMode ? "#141414" : "#fff",
    borderRight: darkMode ? "1px solid #303030" : "1px solid #f0f0f0",
  };

  return (
    <Sider
      width={width}
      collapsed={collapsed}
      theme={darkMode ? "dark" : "light"}
      onCollapse={() => setCollapsed(!collapsed)}
      className={`lg:block hidden transition-colors duration-300 ${darkMode ? "dark-theme" : "light-theme"
        }`}
      style={themeStyles}
      {...props}
    >
      <Menu
        mode="inline"
        items={menuItems}
        theme={darkMode ? "dark" : "light"}
        className="transition-colors duration-300"
      />
    </Sider>
  );
};

export default CustomProfileSlider;
