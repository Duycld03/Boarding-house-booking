import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import i18n from '@/config-translation/config-translation';
import 'flag-icons/css/flag-icons.min.css';
import './LanguageSwitcher.css';
import { useTheme } from '@/context/ThemeContext';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.body.classList.contains('dark');
      setIsDarkMode(dark);
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
      setCurrentLanguage(storedLanguage);
    }

    const handleLanguageChange = (lng) => {
      localStorage.setItem('language', lng);
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      observer.disconnect();
    };
  }, []);

  return (
    <Select
      value={currentLanguage}
      onChange={(lng) => {
        i18n.changeLanguage(lng);
      }}
      className={darkMode ? 'ant-select-dark' : ''}
      style={{ width: 160 }}
      popupClassName={
        darkMode ? 'ant-select-dropdown-dark' : 'ant-select-dropdown-light'
      }
    >
      <Select.Option value="en">
        <span className="fi fi-gb" style={{ marginRight: 8 }}></span> English
      </Select.Option>
      <Select.Option value="vi">
        <span className="fi fi-vn" style={{ marginRight: 8 }}></span> Tiếng Việt
      </Select.Option>
    </Select>
  );
};

export default LanguageSwitcher;
