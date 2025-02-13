import { Link } from "react-router-dom";
import { UserOutlined, ScheduleOutlined } from "@ant-design/icons";

const menuItems = [
  {
    key: "profile",
    label: <Link to={"/profile"}>Profile</Link>,
    icon: <UserOutlined />,
  },
  {
    key: "appointment-management",
    label: <Link to={"/my-appointment"}>My appointment</Link>,
    icon: <ScheduleOutlined />,
  },
];

export default menuItems;
