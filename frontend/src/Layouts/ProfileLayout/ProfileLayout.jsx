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
            padding: "24px 0",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <CustomProfileSlider />
          <div className="w-full">
            <Content className={cx("content-wrapper")}>{children}</Content>
            <FooterComponent />
          </div>
        </Layout>
      </Content>
    </Layout>
  );
}

export default ProfileLayout;
