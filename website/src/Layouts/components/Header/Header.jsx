import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Divider,
  Switch,
} from 'antd';
import classNames from 'classnames/bind';
import Styles from './Header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../assets/images/Icon.svg';
import UserAvatar from '../../../assets/images/none_avatar.png';
import {
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { getUser } from '../../../api/authManagement';
import { useCurrentUser } from '../../../context/userContext';
import adminMenu from '../Slider/menuItem';
import userRole from '../../../constants/userRole';
import getMenuItems from '../ProfileSlider/menuItem';
import { useTheme } from '../../../context/themeContext'; // Import theme context
import LanguageSwitcher from '../../../component/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const cx = classNames.bind(Styles);
const { Header } = Layout;

const CustomHeader = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState(UserAvatar);
  const navigate = useNavigate();
  const { contextLogout, hasRole } = useCurrentUser();
  const { darkMode, toggleDarkMode } = useTheme(); // Use theme context
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        setAvatar(res?.avatarImage?.url || UserAvatar);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    contextLogout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const menuItems = [
    { key: 'home', label: t('menu.home'), onClick: () => navigate('/') },
    {
      key: 'about',
      label: t('menu.about'),
      onClick: () => navigate('/about-us'),
    },
    {
      key: 'contact',
      label: t('menu.contact'),
      onClick: () => navigate('/contact'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('sidebar.profile'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => navigate('/change-password'),
    },
    {
      key: 'dark-mode',
      icon: darkMode ? (
        <BulbFilled style={{ color: '#fadb14' }} />
      ) : (
        <BulbOutlined />
      ),
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      onClick: toggleDarkMode,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Header
      className={cx(
        'flex justify-between items-center px-4 dark:bg-gray-800 dark:text-white bg-white text-gray-800 transition-colors duration-200'
      )}
    >
      {/* Logo */}
      <Link
        to={hasRole(userRole.admin) ? '/dashboard/account-management' : '/'}
        className="flex items-center"
      >
        <img src={Icon} alt="Logo" className="h-20 cursor-pointer" />
        <p
          className={cx(
            'logo-txt font-body text-3xl font-extrabold ml-2 dark:text-white text-gray-800'
          )}
        >
          MOTELLEASE TECH
        </p>
      </Link>

      {/* Main Menu (Desktop) */}
      <Menu
        className="hidden lg:block"
        theme={darkMode ? 'dark' : 'light'}
        mode="horizontal"
        defaultSelectedKeys={['home']}
        items={menuItems.map(({ key, label, onClick }) => ({
          key,
          label: <span onClick={onClick}>{label}</span>,
        }))}
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#fff',
          borderBottom: 'none',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginLeft: 330,
        }}
      />

      {/* User Section */}
      <div className="hidden lg:flex items-center gap-4">
        <LanguageSwitcher />

        {!isLoggedIn ? (
          <Space size={10}>
            <Button
              size="large"
              type="primary"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              size="large"
              className={cx(
                'btn-register',
                darkMode
                  ? 'border-white text-white hover:text-white hover:border-blue-400'
                  : ''
              )}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Space>
        ) : (
          <Dropdown
            menu={{
              items: userMenuItems.map(({ key, label, icon, onClick }) => ({
                key,
                label: (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onClick && onClick();
                    }}
                    className={'text-gray-800 dark:text-white'}
                  >
                    {icon} {label}
                  </span>
                ),
              })),
              style: {
                backgroundColor: darkMode ? '#1f2937' : '#fff',
              },
            }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <Avatar src={avatar} size={60} className="cursor-pointer mr-5" />
          </Dropdown>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center">
        <Button
          type="text"
          icon={<MenuOutlined className={'text-gray-700 dark:text-white'} />}
          onClick={() => setOpen(true)}
          className={darkMode ? 'text-white' : ''}
        />
      </div>

      {/* Drawer (Mobile Menu) */}
      <Drawer
        title={
          isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar src={avatar || UserAvatar} size={60} className="mr-3" />
                <span className={cx('user-name')}>User Name</span>
              </div>
              <div className="w-[120px] mr-4">
                <LanguageSwitcher />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Space size={10}>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="large"
                  className="btn-register dark:bg-gray-900 dark:text-white dark:border-white mr-2"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Space>
              <div className="w-[120px] mr-4">
                <LanguageSwitcher />
              </div>{' '}
            </div>
          )
        }
        placement="right"
        closable
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{
          backgroundColor: darkMode ? '#1f2937' : '#fff',
          padding: '12px 0',
        }}
        headerStyle={{
          backgroundColor: darkMode ? '#1f2937' : '#fff',
          color: darkMode ? '#fff' : 'inherit',
          borderBottom: darkMode ? '1px solid #4b5563' : '1px solid #f0f0f0',
        }}
      >
        <Menu
          mode="vertical"
          theme={darkMode ? 'dark' : 'light'}
          items={(hasRole(userRole.admin) ? adminMenu : menuItems).map(
            ({ key, label, onClick }) => ({
              key,
              label: <span onClick={onClick}>{label}</span>,
            })
          )}
          style={{
            border: 'none',
            marginBottom: 20,
            backgroundColor: darkMode ? '#1f2937' : '#fff',
          }}
        />

        {isLoggedIn && (
          <>
            {!hasRole(userRole.admin) && (
              <>
                <Divider className={darkMode ? 'bg-gray-600' : 'bg-gray-400'} />
                <Menu
                  mode="vertical"
                  theme={darkMode ? 'dark' : 'light'}
                  items={getMenuItems()
                    .filter((item) => item.key !== 'profile')
                    .map(({ key, label, onClick }) => ({
                      key,
                      label: <span onClick={onClick}>{label}</span>,
                    }))}
                  style={{
                    border: 'none',
                    backgroundColor: darkMode ? '#1f2937' : '#fff',
                  }}
                />
              </>
            )}
            <Divider className={darkMode ? 'bg-gray-600' : 'bg-gray-400'} />
            <Menu
              mode="vertical"
              theme={darkMode ? 'dark' : 'light'}
              items={userMenuItems.map(({ key, label, icon, onClick }) => ({
                key,
                label: (
                  <span onClick={onClick}>
                    {icon} {label}
                  </span>
                ),
              }))}
              style={{
                border: 'none',
                backgroundColor: darkMode ? '#1f2937' : '#fff',
              }}
            />
          </>
        )}
      </Drawer>
    </Header>
  );
};

export default CustomHeader;
