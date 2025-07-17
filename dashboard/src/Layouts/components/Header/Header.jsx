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
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faClipboardList,
  faCalendarCheck,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import { getUser } from "../../../api/authAPI";
import { useCurrentUser } from "../../../context/userContext";
import userRole from "../../../constants/userRole";
import { useTheme } from "../../../context/themeContext";
import LanguageSwitcher from "../../../component/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import DefaultAvatar from "../../../assets/images/none_avatar.png";

const cx = classNames.bind(Styles);
const { Header } = Layout;

const CustomHeader = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();
  const { contextLogout, hasRole } = useCurrentUser();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation("common"); // Chỉ sử dụng namespace common

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        setAvatar(res?.avatarImage?.url || null);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    contextLogout();
    setIsLoggedIn(false);
    navigate("/");
  };

  const menuItems = [
    { key: "home", label: t("home"), onClick: () => navigate("/") },
    {
      key: "about",
      label: t("about"),
      onClick: () => navigate("/about-us"),
    },
    {
      key: "contact",
      label: t("contact"),
      onClick: () => navigate("/contact"),
    },
  ];

  // Admin menu items with translation support - moved from menuItem.jsx
  const dashBoard = "/dashboard";
  const adminMenuItems = [
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
      key: "list-boarding-house-reviews",
      label: (
        <Link to={dashBoard + "/list-boarding-house-reviews"}>
          {t("menu.reviewManagement")}
        </Link>
      ),
      icon: <FontAwesomeIcon icon={faCalendarCheck} />,
    },
  ];

  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("profile"),
      onClick: () => navigate("/profile"),
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: t("changePassword"),
      onClick: () => navigate("/change-password"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("logout"),
      onClick: logout,
    },
  ];

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
      title={darkMode ? t("switchToLightMode") : t("switchToDarkMode")}
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
              {t("auth.login-btn")}
            </Button>
            <Button
              size="large"
              className={cx("btn-register")}
              onClick={() => navigate("/register")}
            >
              {t("auth.register-btn")}
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
            <Avatar
              src={avatar}
              size={60}
              className="cursor-pointer mr-5"
              onError={() => {
                setAvatar(DefaultAvatar);
                return false;
              }}
            />
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
                <Avatar
                  src={avatar}
                  size={60}
                  className="mr-3"
                  onError={() => {
                    setAvatar(DefaultAvatar);
                    return false;
                  }}
                />
                <span className={cx("user-name")}>User Name</span>
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
                  {t("auth.login-btn")}
                </Button>
                <Button
                  size="large"
                  className="btn-register dark:bg-gray-900 dark:text-white dark:border-white mr-2"
                  onClick={() => navigate("/register")}
                >
                  {t("auth.register-btn")}
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
        bodyStyle={{
          backgroundColor: darkMode ? "#1f2937" : "#fff",
          padding: "12px 0",
        }}
        headerStyle={{
          backgroundColor: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "inherit",
          borderBottom: darkMode ? "1px solid #4b5563" : "1px solid #f0f0f0",
        }}
      >
        <Menu
          mode="vertical"
          theme={darkMode ? "dark" : "light"}
          items={(hasRole(userRole.admin) ? adminMenuItems : menuItems).map(
            (item) => {
              // Xử lý các item có children (submenu)
              if (item.children) {
                return {
                  key: item.key,
                  label: item.label,
                  icon: item.icon,
                  children: item.children.map((child) => ({
                    key: child.key,
                    label: child.label,
                    icon: child.icon,
                  })),
                };
              }
              // Xử lý item thông thường
              return {
                key: item.key,
                label:
                  typeof item.label === "string" ? (
                    <span onClick={item.onClick}>{item.label}</span>
                  ) : (
                    item.label
                  ),
                icon: item.icon,
              };
            }
          )}
          style={{
            border: "none",
            marginBottom: 20,
            backgroundColor: darkMode ? "#1f2937" : "#fff",
          }}
        />

        {isLoggedIn && (
          <>
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
