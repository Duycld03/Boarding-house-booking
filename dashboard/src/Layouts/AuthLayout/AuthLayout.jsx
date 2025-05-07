import { Layout } from "antd";
import classnames from "classnames/bind";
import Styles from "./AuthLayout.module.css";

const cx = classnames.bind(Styles);
const { Content } = Layout;

function AuthLayout({ children }) {
  return (
    <Layout className={cx("layout-wrapper")}>
      <Content className={cx("layout-content")}>{children}</Content>
    </Layout>
  );
}

export default AuthLayout;
