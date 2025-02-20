import { Link } from 'react-router-dom';
import { UserOutlined, ScheduleOutlined, HomeFilled } from '@ant-design/icons';
import { useCurrentUser } from '../../../context/userContext';
import userRole from '../../../constants/userRole';

const getMenuItems = () => {
  const { hasRole, user } = useCurrentUser(); // Gọi useCurrentUser() trong component
  console.log(user);
  const menuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'appointment-management',
      label: <Link to="/my-appointment">My appointment</Link>,
      icon: <ScheduleOutlined />,
    },
  ];

  // Nếu user có role "owner", thêm mục quản lý nhà trọ
  if (hasRole(userRole.owner)) {
    menuItems.push({
      key: 'bh-management-owner',
      label: <Link to="/bh-management-owner">Boarding House Management</Link>,
      icon: <HomeFilled />,
    });
  }

  return menuItems;
};

export default getMenuItems;
