import { Layout } from "antd";
import classNames from "classnames/bind"; // Corrected import name
import Styles from "./DefaultLayout.module.css";

import CustomHeader from "../components/Header";
import CustomSlider from "../components/Slider";

const cx = classNames.bind(Styles);
const { Content } = Layout;

function DefaultLayout({ children, isLoggedIn }) {
  return (
    <Layout>
      <Content>
        <CustomHeader isAdmin isLoggedIn={isLoggedIn} />
        <Layout
          style={{
            padding: "24px 0",
            minHeight: "calc(100vh - 64px)",
          }}
          className=" dark:bg-gray-700"
        >
          <CustomSlider />
          <Content className={cx("content-wrapper")}>{children}</Content>
        </Layout>
      </Content>
    </Layout>
  );
}

export default DefaultLayout;
