import { Form, Select, Button, Row, Col } from "antd";
import { useEffect, useState } from "react";
import {
  fetchDistricts,
  fetchProvinces,
  fetchProvincesByName,
  fetchWards,
} from "../../../api/apiAddress";

const { Option } = Select;

const SearchBar = ({ setSearchValue }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [form] = Form.useForm();
  const [defaultProvince, setDefaultProvince] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
      setLoadingStates((prev) => ({ ...prev, provinces: false }));
    };

    loadProvinces();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            if (data.address) {
              const detectedProvince =
                data.address.state || data.address.city || "";
              setDefaultProvince(detectedProvince);
            }
          } catch (error) {
            console.error("Lỗi lấy vị trí:", error);
          }
        },
        (err) => {
          console.error("Không thể truy cập vị trí:", err);
        }
      );
    }
  }, []);

  const fetchDefaultProvince = async () => {
    if (!defaultProvince) return; // Không làm gì nếu defaultProvince rỗng

    try {
      const selectedProvince = await fetchProvincesByName(defaultProvince);
      if (!selectedProvince) return; // Không tìm thấy tỉnh phù hợp

      form.setFieldsValue({ province: selectedProvince.name });

      setSearchValue((prev) => ({
        ...prev,
        province: selectedProvince.name,
        district: null,
        ward: null,
      }));

      setLoadingStates((prev) => ({ ...prev, districts: true }));
      const districtsData = await fetchDistricts(selectedProvince.code);
      setDistricts(districtsData);
      setWards([]);
      setLoadingStates((prev) => ({ ...prev, districts: false }));
    } catch (error) {
      console.error("Lỗi khi lấy tỉnh mặc định:", error);
    }
  };

  useEffect(() => {
    fetchDefaultProvince();
  }, [defaultProvince]);

  useEffect(() => {
    if (defaultProvince && provinces.length > 0) {
      const matchedProvince = provinces.find((p) => p.name === defaultProvince);
      if (matchedProvince) {
        form.setFieldsValue({ province: matchedProvince.name });
        loadDistricts(matchedProvince.code);
      }
    }
  }, [defaultProvince, provinces, form]);

  const loadDistricts = async (provinceCode) => {
    setLoadingStates((prev) => ({ ...prev, districts: true }));
    const districtsData = await fetchDistricts(provinceCode);
    setDistricts(districtsData);
    setLoadingStates((prev) => ({ ...prev, districts: false }));
  };

  const loadWards = async (districtCode) => {
    setLoadingStates((prev) => ({ ...prev, wards: true }));
    const wardsData = await fetchWards(districtCode);
    setWards(wardsData);
    setLoadingStates((prev) => ({ ...prev, wards: false }));
  };

  const handleProvinceChange = async (provinceName) => {
    const selectedProvince = provinces.find((p) => p.name === provinceName);

    setSearchValue((prev) => ({
      ...prev,
      province: selectedProvince?.name,
      district: null,
      ward: null,
    }));
    form.setFieldsValue({ district: null, ward: null });

    if (selectedProvince) {
      loadDistricts(selectedProvince.code);
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = async (districtName) => {
    const selectedDistrict = districts.find((d) => d.name === districtName);

    setSearchValue((prev) => ({
      ...prev,
      district: selectedDistrict?.name,
      ward: null,
    }));
    form.setFieldsValue({ ward: null });

    if (selectedDistrict) {
      loadWards(selectedDistrict.code);
    } else {
      setWards([]);
    }
  };

  const handleSubmit = (values) => {
    setSearchValue((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const formItemLabelStyles = {
    color: "inherit",
  };

  return (
    <Form
      form={form}
      className="md:max-w-[1200px] mx-auto dark:bg-gray-700 dark:text-white"
      layout="vertical"
      onFinish={handleSubmit}
    >
      {/* Apply global styles for dark mode labels */}
      <style jsx global>{`
        .dark .ant-form-item-label > label {
          color: #e5e7eb !important; /* text-gray-200 equivalent */
        }
      `}</style>

      <Row gutter={12} align="bottom">
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Province"
            name="province"
            labelCol={{ style: formItemLabelStyles }}
          >
            <Select
              size="large"
              placeholder="Select province"
              value={form.getFieldValue("province")}
              onChange={handleProvinceChange}
              allowClear
              loading={loadingStates.provinces}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {provinces.map((province) => (
                <Option key={province.code} value={province.name}>
                  {province.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="District"
            name="district"
            labelCol={{ style: formItemLabelStyles }}
          >
            <Select
              size="large"
              placeholder="Select district"
              onChange={handleDistrictChange}
              allowClear
              loading={loadingStates.districts}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {districts.map((district) => (
                <Option key={district.code} value={district.name}>
                  {district.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Ward"
            name="ward"
            labelCol={{ style: formItemLabelStyles }}
          >
            <Select
              size="large"
              placeholder="Select ward"
              onChange={(name) =>
                setSearchValue((prev) => ({
                  ...prev,
                  ward: wards.find((w) => w.name === name)?.name,
                }))
              }
              allowClear
              loading={loadingStates.wards}
            >
              {wards.map((ward) => (
                <Option
                  key={ward.code}
                  value={ward.name}
                  className="dark:bg-gray-700 dark:text-white"
                >
                  {ward.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item>
            <Button
              size="large"
              type="primary"
              block
              onClick={() => {
                form.resetFields();
                setSearchValue({ province: null, district: null, ward: null });
                setDistricts([]);
                setWards([]);
              }}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-700"
            >
              Clear
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchBar;
