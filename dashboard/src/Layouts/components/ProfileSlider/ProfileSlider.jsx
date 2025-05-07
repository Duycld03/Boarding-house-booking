import { Layout, Menu } from "antd";
import { useState } from "react";
import getMenuItems from "./menuItem";

const { Sider } = Layout;

const CustomProfileSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = getMenuItems(); // Lấy danh sách menu dựa trên role

  return (
    <Sider
      width={width}
      collapsed={collapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      className="lg:block hidden"
      style={{ background: "#fff" }}
      {...props}
    >
      <Menu mode="inline" items={menuItems} />
    </Sider>
  );
};

export default CustomProfileSlider;
