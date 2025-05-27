import React, { useEffect, useState } from 'react';
import { Form, Select, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import LocationPicker from '../LocationPicker/LocationPicker';
import './AddressSelector.module.css';

const { Option } = Select;
const { TextArea } = Input;

const AddressSelector = ({
  provinces = [],
  districts = [],
  wards = [],
  onProvinceChange,
  onDistrictChange,
  onInputChange,
  formData,
  location,
  initialPosition,
  setGeoLocation,
  darkMode = false,
}) => {
  const { t } = useTranslation('bhManagement'); // namespace theo ví dụ của bạn
  const [currentLocation, setCurrentLocation] = useState(
    initialPosition ? [initialPosition.lat, initialPosition.lon] : null
  );

  useEffect(() => {
    if (initialPosition) return;
    if (location) {
      setCurrentLocation([location?.lat, location?.lon]);
    }
  }, [location]);

  const onLocationChange = (lat, lng) => {
    setGeoLocation((prev) => ({ ...prev, lat, lon: lng }));
    setCurrentLocation([lat, lng]);
  };

  // Classname helper cho dark mode select và input
  const selectClass = classNames({ 'dark-mode-select': darkMode });
  const textareaClass = classNames({ 'dark-mode-input': darkMode });

  // Style inline cho dark mode, bạn có thể customize thêm
  const darkSelectDropdownStyle = darkMode
    ? { backgroundColor: '#374151', color: '#F9FAFB' }
    : {};
  const darkInputStyle = darkMode
    ? { borderColor: '#4B5563', color: '#F9FAFB' }
    : {};

  return (
    <div className="col-span-2">
      <Form layout="vertical">
        {/* Province Selector */}
        <Form.Item label={t('form.labels.province')} required className="mb-2">
          <Select
            placeholder={t('form.placeholders.selectProvince')}
            value={formData?.address?.province || undefined}
            onChange={(value) => {
              onProvinceChange({
                target: { name: 'address.province', value },
              });
              onInputChange({
                target: { name: 'address.district', value: '' },
              });
              onInputChange({
                target: { name: 'address.ward', value: '' },
              });
            }}
            allowClear
            className={selectClass}
            dropdownStyle={darkSelectDropdownStyle}
            popupClassName={darkMode ? 'dark-mode-select-dropdown' : ''}
          >
            {provinces.map((province) => (
              <Option key={province.code} value={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* District Selector */}
        <Form.Item label={t('form.labels.district')} required className="mb-2">
          <Select
            placeholder={t('form.placeholders.selectDistrict')}
            value={formData?.address?.district || undefined}
            onChange={(value) => {
              onDistrictChange({
                target: { name: 'address.district', value },
              });
              onInputChange({
                target: { name: 'address.ward', value: '' },
              });
            }}
            disabled={!formData?.address?.province}
            allowClear
            className={selectClass}
            dropdownStyle={darkSelectDropdownStyle}
          >
            {districts.map((district) => (
              <Option key={district.code} value={district.name}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ward Selector */}
        <Form.Item label={t('form.labels.ward')} required className="mb-2">
          <Select
            placeholder={t('form.placeholders.selectWard')}
            value={formData?.address?.ward || undefined}
            onChange={(value) => {
              onInputChange({
                target: { name: 'address.ward', value },
              });
            }}
            disabled={!formData?.address?.district}
            allowClear
            className={selectClass}
            dropdownStyle={darkSelectDropdownStyle}
          >
            {wards.map((ward) => (
              <Option key={ward.code} value={ward.name}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Address Details */}
        <Form.Item label={t('form.labels.details')} required>
          <TextArea
            placeholder={t('form.placeholders.inputDetailsAddress')}
            value={formData?.address?.detail || ''}
            onChange={onInputChange}
            name="address.detail"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className={textareaClass}
            style={darkInputStyle}
          />
        </Form.Item>
      </Form>
      {/* Nếu bạn có LocationPicker thì thêm ở đây, truyền darkMode nếu hỗ trợ */}
      <LocationPicker
        onChange={onLocationChange}
        geoJson={location?.geojson}
        initialPosition={currentLocation}
        // darkMode={darkMode}
      />
    </div>
  );
};

export default AddressSelector;
