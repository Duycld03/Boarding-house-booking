import { Link } from 'react-router-dom';
import {
  UserOutlined,
  ScheduleOutlined,
  HomeFilled,
  SnippetsOutlined,
  ContainerOutlined,
  HeartOutlined,
  EyeOutlined,
  RollbackOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useCurrentUser } from '../../../context/userContext';
import userRole from '../../../constants/userRole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';

const getMenuItems = () => {
  const { hasRole } = useCurrentUser(); // Lấy thông tin user từ context

  const isOwner = hasRole(userRole.owner);
  const isUser = hasRole(userRole.user);
  const isStaff = hasRole(userRole.staff);

  const menuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
      visible: true, // Ai cũng có quyền xem
    },
    {
      key: 'appointment-management',
      label: <Link to="/my-appointment">My appointment</Link>,
      icon: <ScheduleOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: 'favourite-list',
      label: <Link to="/favourite-list">My favourite</Link>,
      icon: <HeartOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: 'watch-later',
      label: <Link to="/watch-later">Watch later</Link>,
      icon: <EyeOutlined />,
      visible: isUser, // Chỉ User
    },
    {
      key: 'bh-management-owner',
      label: <Link to="/bh-management-owner">Boarding House Management</Link>,
      icon: <HomeFilled />,
      visible: isOwner || isStaff, // Chỉ Owner
    },
    {
      key: 'deposit-list',
      label: <Link to="/deposit-list">Deposit Management</Link>,
      icon: <ContainerOutlined />,
      visible: isOwner || isStaff, // Chỉ Owner
    },
    {
      key: 'my-owner-report',
      label: <Link to="/my-report-management">My report management</Link>,
      icon: <SnippetsOutlined />,
      visible: isUser,
    },
    {
      key: 'my-deposited-room',
      label: <Link to="/my-deposited-room">My Deposited Room</Link>,
      icon: <ContainerOutlined />,
      visible: isUser,
    },
    {
      key: 'my-renewal-request',
      label: <Link to="/my-renewal-request">My Renewal Request</Link>,
      icon: <FontAwesomeIcon icon={faEnvelope} />,
      visible: isUser,
    },
    {
      key: 'my-rent-room',
      label: <Link to="/my-rent-payment">My Rent Payment</Link>,
      icon: <FontAwesomeIcon icon={faMoneyBill} />,
      visible: isUser,
    },
    {
      key: 'my-deposit-refund-request',
      label: (
        <Link to="/my-deposit-refund-request">My Deposit Refund Request</Link>
      ),
      icon: <RollbackOutlined />,
      visible: isUser,
    },
    {
      key: 'refund-request-management',
      label: (
        <Link to="/refund-request-management">Deposit Refund Management</Link>
      ),
      icon: <RollbackOutlined />,
      visible: isOwner,
    },
    {
      key: 'revenue-management-owner',
      label: <Link to="/revenue-management-owner">Revenue Management</Link>,
      icon: <DollarCircleOutlined />,
      visible: isOwner,
    },
    {
      key: 'task-management',
      label: <Link to="/task-management">Task Management</Link>,
      icon: <DollarCircleOutlined />,
      visible: isOwner || isStaff,
    },
  ];
  return menuItems.filter((item) => item.visible);
};

export default getMenuItems;
