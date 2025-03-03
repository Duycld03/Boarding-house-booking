import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Grid,
  Divider,
} from "antd";
import classNames from "classnames/bind";
import Styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../assets/images/Icon.svg";
import UserAvatar from "../../../assets/images/none_avatar.png";
import {
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getUser } from "../../../api/authManagement";
import { useCurrentUser } from "../../../context/userContext";
import adminMenu from "../Slider/menuItem";
import userRole from "../../../constants/userRole";
import getMenuItems from "../ProfileSlider/menuItem";

const cx = classNames.bind(Styles);
const { useBreakpoint } = Grid;
const { Header } = Layout;

const CustomHeader = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState(UserAvatar);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { contextLogout, hasRole } = useCurrentUser();

  useEffect(() => {
    (async () => {
      try {
        const res = await getUser();
        setAvatar(res.avatarImage?.url || UserAvatar);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    contextLogout();
    setIsLoggedIn(false);
    navigate("/");
  };

  const menuItems = [
    { key: "home", label: "Home", onClick: () => navigate("/") },
    { key: "about", label: "About Us", onClick: () => navigate("/about-us") },
    { key: "contact", label: "Contact", onClick: () => navigate("/contact") },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Change Password",
      onClick: () => navigate("/change-password"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];

  const userMenu = <Menu items={userMenuItems} />;

  return (
    <Header className={cx("flex justify-between items-center bg-white")}>
      {/* Logo */}
      <Link
        to={hasRole(userRole.admin) ? "/dashboard/account-management" : "/"}
        className="flex items-center bg-white"
      >
        <img
          src={Icon}
          alt="Logo"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <p className={cx("logo-txt font-body text-3xl font-extrabold ml-2")}>
          MOTELLEASE TECH
        </p>
      </Link>

      {/* Main Menu (Desktop) */}
      {screens.lg && (
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["home"]}
          items={menuItems}
        />
      )}

      {/* User Section */}
      {!isLoggedIn ? (
        <Space size={10} className="hidden lg:flex">
          <Button
            size="large"
            type="primary"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            size="large"
            className={cx("btn-register")}
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </Space>
      ) : (
        <Dropdown overlay={userMenu} placement="bottomRight" arrow>
          <Avatar
            src={avatar}
            size={60}
            className="hidden lg:block cursor-pointer mr-5"
          />
        </Dropdown>
      )}

      {/* Mobile Menu Toggle */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setOpen(!open)}
        className="lg:hidden"
      />

      {/* Drawer (Mobile Menu) */}
      <Drawer
        title={
          isLoggedIn ? (
            <div className="flex items-center">
              <Avatar src={avatar} size={60} className="mr-3" />
              <span className={cx("user-name")}>User Name</span>
            </div>
          ) : (
            <Space size={10}>
              <Button
                size="large"
                type="primary"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                size="large"
                className={cx("btn-register")}
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </Space>
          )
        }
        placement="right"
        closable
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu
          mode="vertical"
          items={hasRole(userRole.admin) ? adminMenu : menuItems}
          style={{ border: "none", marginBottom: 20 }}
        />

        {isLoggedIn && (
          <>
            {!hasRole(userRole.admin) && (
              <>
                <Divider className="bg-gray-400" />
                <Menu
                  mode="vertical"
                  items={getMenuItems().filter(
                    (item) => item.key !== "profile"
                  )}
                  style={{ border: "none" }}
                />
              </>
            )}
            <Divider className="bg-gray-400" />
            <Menu
              mode="vertical"
              items={userMenuItems}
              style={{ border: "none" }}
            />
          </>
        )}
      </Drawer>
    </Header>
  );
};

export default CustomHeader;
