import React, { useEffect, useState } from "react";
import { Form, Select, Input } from "antd";
import LocationPicker from "../LocationPicker/LocationPicker";

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
      <LocationPicker
        onChange={onLocationChange}
        geoJson={location?.geojson}
        initialPosition={currentLocation}
      />
      <Form layout="vertical">
        {/* Province Selector */}
        <Form.Item label="Province" required className="mb-2">
          <Select
            placeholder="Select province"
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
        <Form.Item label="District" required className="mb-2">
          <Select
            placeholder="Select district"
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
        <Form.Item label="Ward" required className="mb-2">
          <Select
            placeholder="Select ward"
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
        <Form.Item label="Details" required>
          <TextArea
            placeholder="Input details boarding house address"
            value={formData?.address?.detail || ""}
            onChange={(e) => {
              onInputChange(e);
            }}
            name="address.detail"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddressSelector;
