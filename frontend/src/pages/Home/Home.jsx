import classNames from "classnames/bind";
import Styles from "./Home.module.css";

const cx = classNames.bind(Styles);

function Home() {
  return (
    <div className={cx("")}>
      <h2>This is home</h2>
    </div>
  );
}

export default Home;
