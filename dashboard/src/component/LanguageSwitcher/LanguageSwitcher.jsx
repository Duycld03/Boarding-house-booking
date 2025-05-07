import React, { useEffect } from 'react';
import { Select } from 'antd';
import i18n from '@/config-translation/config-translation'; // ✅ import đúng từ file đã init

const LanguageSwitcher = () => {
  useEffect(() => {
    console.log('Initial language:', i18n.language);
  }, []);

  return (
    <Select
      value={i18n.language}
      onChange={(lng) => {
        i18n.changeLanguage(lng);
        console.log('Switched language to:', lng);
      }}
      style={{ width: 120 }}
    >
      <Select.Option value="en">English</Select.Option>
      <Select.Option value="vi">Tiếng Việt</Select.Option>
    </Select>
  );
};

export default LanguageSwitcher;
