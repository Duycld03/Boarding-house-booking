import { Layout, Menu } from "antd";
import { useState } from "react";
import menuItem from "./menuItem";
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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/themeContext"; // Giả sử bạn có context này

const { Sider } = Layout;

const CustomSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme(); // Lấy trạng thái darkMode từ context

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const dashBoard = "/dashboard";

  const { t } = useTranslation("menu");

  const menuItems = [
    {
      key: "account-management",
      label: (
        <Link to={dashBoard + "/account-management"}>
          {t("account-management")}
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      key: "report-management",
      label: t("report-management"),
      icon: <FileDoneOutlined />,
      children: [
        {
          key: "report-review-management",
          label: (
            <Link to={dashBoard + "/report-review-management"}>
              {t("report-review-management")}
            </Link>
          ),
          icon: <FileTextOutlined />,
        },
        {
          key: "report-boarding-house-management",
          label: (
            <Link to={dashBoard + "/report-boarding-house-management"}>
              {t("report-boarding-house-management")}
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
          {t("boarding-house-management")}
        </Link>
      ),
      icon: <HomeOutlined />,
    },
    // {
    //   key: "boarding-house-type-management",
    //   label: (
    //     <Link to={dashBoard + "/boarding-house-type-management"}>
    //       {t("boarding-house-type-management")}
    //     </Link>
    //   ),
    //   icon: <HomeOutlined />,
    // },
    {
      key: "list-boarding-house-reviews",
      label: (
        <Link to={dashBoard + "/list-boarding-house-reviews"}>
          {t("list-boarding-house-reviews")}
        </Link>
      ),
      icon: <FontAwesomeIcon icon={faCalendarCheck} />,
    },
    // {
    //   key: "facilities-management",
    //   label: (
    //     <Link to={dashBoard + "/facilities-management"}>
    //       {t("facilities-management")}
    //     </Link>
    //   ),
    //   icon: <FontAwesomeIcon icon={faTools} />,
    // },
  ];

  return (
    <Sider
      width={width}
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="lg:block hidden dark:bg-gray-800"
      {...props}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        style={{
          height: "100%",
          backgroundColor: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#d1d5db" : "inherit",
          borderRight: "none",
        }}
        theme={darkMode ? "dark" : "light"}
        items={menuItems}
      />
    </Sider>
  );
};

export default CustomSlider;
