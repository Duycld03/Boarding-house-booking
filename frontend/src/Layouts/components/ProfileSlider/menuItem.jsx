import { Link } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

const menuItems = [
  {
    key: "profile",
    label: <Link to={"/profile"}>Profile</Link>,
    icon: <UserOutlined />,
  },
];

export default menuItems;
