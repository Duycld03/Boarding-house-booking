import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import i18n from '@/config-translation/config-translation'; // ✅ import đúng từ file đã init
import 'flag-icons/css/flag-icons.min.css';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    // Check localStorage for saved language
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
      setCurrentLanguage(storedLanguage);
    }
    console.log('Initial language:', i18n.language);

    // Listen for language changes and update localStorage
    const handleLanguageChange = (lng) => {
      localStorage.setItem('language', lng);
      setCurrentLanguage(lng);
    };

    // Subscribe to i18n language change event
    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup the subscription when the component is unmounted
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <Select
      value={currentLanguage}
      onChange={(lng) => {
        i18n.changeLanguage(lng);
        console.log('Switched language to:', lng);
      }}
      style={{ width: 150 }}
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
