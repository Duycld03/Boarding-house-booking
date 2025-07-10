import React, { useEffect, useState } from "react";
import { Form, Select, Input } from "antd";
import LocationPicker from "../LocationPicker/LocationPicker";
import { useTranslation } from "react-i18next";

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
}) => {
  const [currentLocation, setCurrentLocation] = useState(
    initialPosition ? [initialPosition.lat, initialPosition.lon] : null
  );
  const { t } = useTranslation("addBoardingHouseAdmin");

  useEffect(() => {
    if (initialPosition) return;
    if (location) {
      setCurrentLocation([location?.lat, location?.lon]);
    }
  }, [location]);

  const onLocationChange = (lat, lng) => {
    setGeoLocation((prev) => {
      return { ...prev, lat, lon: lng };
    });
    setCurrentLocation([lat, lng]);
  };
  return (
    <div className="col-span-2">
      <Form layout="vertical">
        {/* Province Selector */}
        <Form.Item
          label={t("selectProvince")}
          required
          className="mb-2"
          rules={[{ required: true, message: t("validation.selectProvince") }]}
        >
          <Select
            placeholder={t("selectProvince")}
            value={formData?.address?.province || undefined}
            onChange={(value) => {
              // Reset district and ward when province changes
              onProvinceChange({
                target: { name: "address.province", value },
              });
              onInputChange({
                target: { name: "address.district", value: "" },
              });
              onInputChange({
                target: { name: "address.ward", value: "" },
              });
            }}
            allowClear
          >
            {provinces.map((province) => (
              <Option key={province.code} value={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* District Selector */}
        <Form.Item
          label={t("selectDistrict")}
          required
          className="mb-2"
          rules={[{ required: true, message: t("validation.selectDistrict") }]}
        >
          <Select
            placeholder={t("selectDistrict")}
            value={formData?.address?.district || undefined}
            onChange={(value) => {
              // Reset ward when district changes
              onDistrictChange({
                target: { name: "address.district", value },
              });
              onInputChange({
                target: { name: "address.ward", value: "" },
              });
            }}
            disabled={!formData?.address?.province}
            allowClear
          >
            {districts.map((district) => (
              <Option key={district.code} value={district.name}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ward Selector */}
        <Form.Item
          label={t("selectWard")}
          required
          className="mb-2"
          rules={[{ required: true, message: t("validation.selectWard") }]}
        >
          <Select
            placeholder={t("selectWard")}
            value={formData?.address?.ward || undefined}
            onChange={(value) => {
              onInputChange({
                target: { name: "address.ward", value },
              });
            }}
            disabled={!formData?.address?.district}
            allowClear
          >
            {wards.map((ward) => (
              <Option key={ward.code} value={ward.name}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Address Details */}
        <Form.Item
          label={t("enterDetailAddress")}
          required
          rules={[{ required: true, message: t("validation.enterDetailAddress") }]}
        >
          <TextArea
            placeholder={t("enterDetailAddress")}
            value={formData?.address?.detail || ""}
            onChange={(e) => {
              onInputChange(e);
            }}
            name="address.detail"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
      </Form>
      <LocationPicker
        onChange={onLocationChange}
        geoJson={location?.geojson}
        initialPosition={currentLocation}
      />
    </div>
  );
};

export default AddressSelector;
