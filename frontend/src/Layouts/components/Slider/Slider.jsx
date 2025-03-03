import { Layout, Menu } from "antd";

import { useState } from "react";
import menuItem from "./menuItem";

const { Sider } = Layout;

const CustomSlider = ({ width = 250, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      width={width}
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="lg:block hidden"
      style={{ background: "#fff" }}
      {...props}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        style={{ height: "100%" }}
        items={menuItem}
      />
    </Sider>
  );
};

export default CustomSlider;
