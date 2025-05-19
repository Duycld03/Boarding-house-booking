import { Layout } from "antd";
import classNames from "classnames/bind"; // Corrected import name
import Styles from "./ProfileLayout.module.css";

import CustomHeader from "../components/Header";
import CustomProfileSlider from "../components/ProfileSlider";
import FooterComponent from "../components/Footer/Footer";

const cx = classNames.bind(Styles);
const { Content } = Layout;

function ProfileLayout({ children, isLoggedIn }) {
  return (
    <Layout>
      <Content>
        <CustomHeader isAdmin isLoggedIn={isLoggedIn} />
        <Layout
          style={{
            padding: "10px 0",
            minHeight: "calc(100vh - 64px)",
          }}
          className="bg-gray-300 dark:bg-gray-700"
        >
          <CustomProfileSlider />
          <Content
            className={cx("content-wrapper", "bg-gray-300 dark:bg-gray-700")}
          >
            {children}
          </Content>
        </Layout>
        <Layout>
          <FooterComponent />
        </Layout>
      </Content>
    </Layout>
  );
}

export default ProfileLayout;
