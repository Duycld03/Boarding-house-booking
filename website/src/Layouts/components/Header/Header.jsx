import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Divider,
} from "antd";
import classNames from "classnames/bind";
import Styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../assets/images/newLogo.png";
import {
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
  HomeOutlined,
  FileTextOutlined,
  FileDoneOutlined,
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
import {
  faCreditCard,
  faClipboardList,
  faCalendarCheck,
  faTools,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { getUser } from "../../../api/authAPI";
import { useCurrentUser } from "../../../context/userContext";
import userRole from "../../../constants/userRole";
import { useTheme } from "../../../context/themeContext";
import LanguageSwitcher from "../../../component/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import DefaultAvatar from "../../../assets/images/none_avatar.png";
import { useImageValidation } from "../../../hooks/useImageValidation";

const cx = classNames.bind(Styles);
const { Header } = Layout;

const CustomHeader = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarSource, setAvatarSource] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { contextLogout, hasRole } = useCurrentUser();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation(["common", "profile"]);

  // Sử dụng hook useImageValidation để quản lý avatar
  const { src: validAvatarUrl, isLoading: avatarLoading } = useImageValidation(
    avatarSource,
    DefaultAvatar
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        setAvatarSource(res?.avatarImage?.url || null);
        setUsername(res?.username || t("common:general.user"));
        setIsLoggedIn(true);
      } catch (error) {
        if (error.status === 401) {
          localStorage.removeItem("access_token");
          contextLogout();
          navigate("/");
        }
        setIsLoggedIn(false);
        setAvatarSource(null);
      }
    };
    fetchUser();
  }, [t]);

  const logout = () => {
    localStorage.removeItem("access_token");
    contextLogout();
    setIsLoggedIn(false);
    navigate("/");
  };

  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("common:profile"),
      onClick: () => navigate("/profile"),
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: t("common:changePassword"),
      onClick: () => navigate("/change-password"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("common:logout"),
      onClick: logout,
    },
  ];

  // Tạo component UserAvatar cho việc hiển thị avatar với trạng thái loading
  const UserAvatar = ({ size = 60, className = "" }) => (
    <div className="relative">
      <Avatar
        src={validAvatarUrl}
        size={size}
        className={`${className} ${
          avatarLoading ? "opacity-70" : ""
        } cursor-pointer`}
      />
      {avatarLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
          <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
        </div>
      )}
    </div>
  );

  // Profile menu items từ menuItem.jsx với đa ngôn ngữ
  const getProfileMenuItems = () => {
    const isOwner = hasRole(userRole.owner);
    const isUser = hasRole(userRole.user);
    const isStaff = hasRole(userRole.staff);

    const profileMenuItems = [
      {
        key: "profile",
        label: <Link to="/profile">{t("profile:menu.profile")}</Link>,
        icon: <UserOutlined />,
        visible: true, // Ai cũng có quyền xem
      },
      {
        key: "appointment-management",
        label: (
          <Link to="/my-appointment">{t("profile:menu.myAppointment")}</Link>
        ),
        icon: <ScheduleOutlined />,
        visible: isUser, // Chỉ User
      },
      {
        key: "favourite-list",
        label: (
          <Link to="/favourite-list">{t("profile:menu.myFavourite")}</Link>
        ),
        icon: <HeartOutlined />,
        visible: isUser, // Chỉ User
      },
      {
        key: "watch-later",
        label: <Link to="/watch-later">{t("profile:menu.watchLater")}</Link>,
        icon: <EyeOutlined />,
        visible: isUser, // Chỉ User
      },
      {
        key: "bh-management-owner",
        label: (
          <Link to="/bh-management-owner">
            {t("profile:menu.boardingHouseManagement")}
          </Link>
        ),
        icon: <HomeFilled />,
        visible: isOwner || isStaff, // Chỉ Owner và Staff
      },
      {
        key: "deposit-list",
        label: (
          <Link to="/deposit-list">{t("profile:menu.depositManagement")}</Link>
        ),
        icon: <ContainerOutlined />,
        visible: isOwner || isStaff, // Chỉ Owner và Staff
      },
      {
        key: "staff-list",
        label: (
          <Link to="/staff-list">{t("profile:menu.staffManagement")}</Link>
        ),
        icon: <ContainerOutlined />,
        visible: isOwner, // Chỉ Owner
      },
      {
        key: "my-owner-report",
        label: (
          <Link to="/my-report-management">
            {t("profile:menu.myReportManagement")}
          </Link>
        ),
        icon: <SnippetsOutlined />,
        visible: isUser,
      },
      {
        key: "my-deposited-room",
        label: (
          <Link to="/my-deposited-room">
            {t("profile:menu.myDepositedRoom")}
          </Link>
        ),
        icon: <ContainerOutlined />,
        visible: isUser,
      },
      {
        key: "my-renewal-request",
        label: (
          <Link to="/my-renewal-request">
            {t("profile:menu.myRenewalRequest")}
          </Link>
        ),
        icon: <FontAwesomeIcon icon={faEnvelope} />,
        visible: isUser,
      },
      {
        key: "my-rent-room",
        label: (
          <Link to="/my-rent-payment">{t("profile:menu.myRentPayment")}</Link>
        ),
        icon: <FontAwesomeIcon icon={faMoneyBill} />,
        visible: isUser,
      },
      {
        key: "my-deposit-refund-request",
        label: (
          <Link to="/my-deposit-refund-request">
            {t("profile:menu.myDepositRefundRequest")}
          </Link>
        ),
        icon: <RollbackOutlined />,
        visible: isUser,
      },
      {
        key: "refund-request-management",
        label: (
          <Link to="/refund-request-management">
            {t("profile:menu.depositRefundManagement")}
          </Link>
        ),
        icon: <RollbackOutlined />,
        visible: isOwner,
      },
      {
        key: "revenue-management-owner",
        label: (
          <Link to="/revenue-management-owner">
            {t("profile:menu.revenueManagement")}
          </Link>
        ),
        icon: <DollarCircleOutlined />,
        visible: isOwner,
      },
      {
        key: "task-management",
        label: (
          <Link to="/task-management">{t("profile:menu.taskManagement")}</Link>
        ),
        icon: <DollarCircleOutlined />,
        visible: isOwner || isStaff,
      },
    ];

    return profileMenuItems.filter((item) => item.visible);
  };

  // Theme toggle button component
  const ThemeToggleButton = () => (
    <Button
      shape="circle"
      size="large"
      icon={
        darkMode ? (
          <BulbFilled style={{ fontSize: "20px", color: "#fadb14" }} />
        ) : (
          <BulbOutlined style={{ fontSize: "20px", color: "#40BFFF" }} />
        )
      }
      onClick={toggleDarkMode}
      className={`flex items-center justify-center ${
        darkMode
          ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:text-yellow-300 border-gray-600"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
      }`}
      title={
        darkMode ? t("common:switchToLightMode") : t("common:switchToDarkMode")
      }
    />
  );

  return (
    <Header
      className={cx(
        "flex justify-between items-center px-4 dark:bg-gray-800 dark:text-white bg-white text-gray-800 transition-colors duration-200"
      )}
    >
      {/* Logo */}
      <Link
        to={hasRole(userRole.admin) ? "/dashboard/account-management" : "/"}
        className="flex items-center"
      >
        <img
          src={Icon}
          alt="Logo"
          className="flex-shrink-0 h-32 w-36 cursor-pointer"
        />
        <p
          className={cx(
            "logo-txt font-body text-3xl font-extrabold ml-2 dark:text-white text-gray-800"
          )}
        >
          MOTELLEASE TECH
        </p>
      </Link>

      {/* User Section */}
      <div className="hidden lg:flex items-center gap-4">
        <ThemeToggleButton />
        <LanguageSwitcher />

        {!isLoggedIn ? (
          <Space size={10}>
            <Button
              size="large"
              type="primary"
              onClick={() => navigate("/login")}
            >
              {t("common:auth.login-btn")}
            </Button>
            <Button
              size="large"
              className={cx("btn-register")}
              onClick={() => navigate("/register")}
            >
              {t("common:auth.register-btn")}
            </Button>
          </Space>
        ) : (
          <Dropdown
            menu={{
              items: userMenuItems.map(({ key, label, icon, onClick }) => ({
                key,
                label: (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onClick && onClick();
                    }}
                    className={"text-gray-800 dark:text-white"}
                  >
                    {icon} {label}
                  </span>
                ),
              })),
              style: {
                backgroundColor: darkMode ? "#1f2937" : "#fff",
              },
            }}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <div className="mr-5">
              <UserAvatar size={60} />
            </div>
          </Dropdown>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center space-x-2">
        <ThemeToggleButton />
        <Button
          shape="circle"
          size="large"
          icon={
            <MenuOutlined
              style={{ fontSize: "18px" }}
              className={darkMode ? "text-white" : "text-gray-700"}
            />
          }
          onClick={() => setOpen(true)}
          className={
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-200"
          }
        />
      </div>

      {/* Drawer (Mobile Menu) */}
      <Drawer
        title={
          isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserAvatar size={60} className="mr-3" />
                <span className={cx("user-name")}>{username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSwitcher />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Space size={10}>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => navigate("/login")}
                >
                  {t("common:auth.login-btn")}
                </Button>
                <Button
                  size="large"
                  className="btn-register dark:bg-gray-900 dark:text-white dark:border-white mr-2"
                  onClick={() => navigate("/register")}
                >
                  {t("common:auth.register-btn")}
                </Button>
              </Space>
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>
            </div>
          )
        }
        placement="right"
        closable
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: {
            backgroundColor: darkMode ? "#1f2937" : "#fff",
            padding: "12px 0",
          },
          header: {
            backgroundColor: darkMode ? "#1f2937" : "#fff",
            color: darkMode ? "#fff" : "inherit",
            borderBottom: darkMode ? "1px solid #4b5563" : "1px solid #f0f0f0",
          },
        }}
      >
        {isLoggedIn && (
          <>
            {!hasRole(userRole.admin) && (
              <>
                <Menu
                  mode="vertical"
                  theme={darkMode ? "dark" : "light"}
                  items={getProfileMenuItems()
                    .filter((item) => item.key !== "profile")
                    .map(({ key, label, icon }) => ({
                      key,
                      label,
                      icon,
                    }))}
                  style={{
                    border: "none",
                    backgroundColor: darkMode ? "#1f2937" : "#fff",
                  }}
                />
              </>
            )}
            <Divider className={darkMode ? "bg-gray-600" : "bg-gray-400"} />
            <Menu
              mode="vertical"
              theme={darkMode ? "dark" : "light"}
              items={userMenuItems.map(({ key, label, icon, onClick }) => ({
                key,
                label: (
                  <span onClick={onClick}>
                    {icon} {label}
                  </span>
                ),
              }))}
              style={{
                border: "none",
                backgroundColor: darkMode ? "#1f2937" : "#fff",
              }}
            />
          </>
        )}
      </Drawer>
    </Header>
  );
};

export default CustomHeader;
