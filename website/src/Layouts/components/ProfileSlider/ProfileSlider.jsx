import { Layout, Menu } from "antd";
import { useState } from "react";
import getMenuItems from "./menuItem";
import { useTheme } from "@/context/ThemeContext";

const { Sider } = Layout;

const CustomProfileSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = getMenuItems(); // Lấy danh sách menu dựa trên role
  const { darkMode } = useTheme();

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
      className={`lg:block hidden transition-colors duration-300 ${
        darkMode ? "dark-theme" : "light-theme"
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
