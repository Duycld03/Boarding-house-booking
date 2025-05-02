import classnames from "classnames/bind";
import Styles from "./HeaderOnly.module.css";
import { Layout } from "antd";
import Header from "../components/Header";
import FooterComponent from "../components/Footer/Footer";

const cx = classnames.bind(Styles);
const { Content } = Layout;

function HeaderOnly({ children, isLoggedIn }) {
  return (
    <Layout className={cx("layout-container")}>
      <Header isLoggedIn={isLoggedIn} />
      <Content className={cx("layout-content", "bg-gray-300 dark:bg-gray-700")}>
        {children}
      </Content>
      <FooterComponent />
    </Layout>
  );
}

export default HeaderOnly;
