import { Link } from 'react-router-dom';
import { UserOutlined, ScheduleOutlined, HomeFilled } from '@ant-design/icons';

const menuItems = [
  {
    key: 'profile',
    label: <Link to={'/profile'}>Profile</Link>,
    icon: <UserOutlined />,
  },
  {
    key: 'appointment-management',
    label: <Link to={'/my-appointment'}>My appointment</Link>,
    icon: <ScheduleOutlined />,
  },
  {
    key: 'bh-management-owner',
    label: <Link to={'/bh-management-owner'}>Boarding House Management</Link>,
    icon: <HomeFilled />,
  },
];

export default menuItems;
