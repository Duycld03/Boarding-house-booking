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

const cx = classNames.bind(Styles);
const { useBreakpoint } = Grid;
const { Header } = Layout;

const CustomHeader = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const checkUser = async () => {
    try {
      const res = await getUser();
      if (res.role === "admin") {
        setIsAdmin(true);
      }
      setIsLoggedIn(true);
    } catch (error) {}
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/");
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Menu items for navigation
  const menuItems = [
    { key: "home", label: "Home", onClick: () => navigate("/") },
    { key: "about", label: "About Us", onClick: () => navigate("/about-us") },
    { key: "contact", label: "Contact", onClick: () => navigate("/contact") },
  ];

  // User menu for dropdown

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: "Profile",
          onClick: () => navigate("/profile"),
        },
        {
          key: "change-password",
          icon: <LockOutlined />, // Icon cho Change Password
          label: "Change Password",
          onClick: () => navigate("/change-password"),
        },
        {
          key: "logout",
          icon: <LogoutOutlined />, // Icon cho Logout
          label: "Logout",
          onClick: logout,
        },
      ]}
    />
  );

  // Toggle Drawer state
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Header className={cx("flex justify-between items-center bg-white")}>
      {/* Logo Section */}
      <Link
        to={isAdmin ? "/dashboard/account-management" : "/"}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <img
          src={Icon}
          alt="Logo"
          style={{ height: "50px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <p className={cx("logo-txt font-body text-3xl font-extrabold ml-2")}>
          MOTELLEASE TECH
        </p>
      </Link>

      {/* Menu Section (for large screens) */}
      {!isAdmin && screens.lg && (
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["home"]}
          items={menuItems}
        />
      )}

      {/* User Section */}
      {!isLoggedIn ? (
        screens.lg && (
          <div className={cx("btn-wrapper")}>
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
          </div>
        )
      ) : (
        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          arrow
          overlayStyle={{
            fontSize: "16px",
            padding: "8px",
            width: 200,
          }}
        >
          {screens.lg && (
            <Avatar
              src={UserAvatar}
              size={60}
              style={{ cursor: "pointer", marginRight: 20 }}
            />
          )}
        </Dropdown>
      )}

      {!screens.lg && (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            className={cx("drawer-toggle-btn")}
          />

          <Drawer
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                {!isLoggedIn ? (
                  <div className={cx("ml-5")}>
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
                  </div>
                ) : (
                  <>
                    <Avatar
                      src={UserAvatar}
                      size={60}
                      style={{ cursor: "pointer", marginRight: 20 }}
                    />
                    <span className={cx("user-name")}>User Name</span>
                  </>
                )}
              </div>
            }
            placement="right"
            closable
            onClose={toggleDrawer}
            open={open}
          >
            <Menu
              mode="vertical"
              items={menuItems}
              style={{ border: "none", marginBottom: 20 }}
            />
            {isLoggedIn && (
              <>
                <Divider className="bg-gray-400" />
                <Menu
                  mode="vertical"
                  items={[
                    {
                      key: "profile",
                      label: "Profile",
                      onClick: () => navigate("/profile"),
                    },
                    {
                      key: "change-password",
                      label: "Change Password",
                      onClick: () => navigate("/change-password"),
                    },
                    {
                      key: "logout",
                      label: "Logout",
                      onClick: logout,
                    },
                  ]}
                  style={{ border: "none" }}
                />
              </>
            )}
          </Drawer>
        </>
      )}
    </Header>
  );
};

export default CustomHeader;
