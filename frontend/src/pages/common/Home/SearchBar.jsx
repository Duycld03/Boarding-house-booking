import { Form, Select, Button, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import {
  fetchDistricts,
  fetchProvinces,
  fetchProvincesByName,
  fetchWards,
} from "../../../api/apiAddress";
import { filterBHUser } from "../../../api/BoardingHManagement";
import formatAmount from "@/utils/formatAmount";
import { toast } from "react-toastify";
import FilterBoardingHouseUser from "./FilterBoardingHouseUser";

const { Option } = Select;

const SearchBar = ({ setSearchResults }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    districts: false,
    wards: false,
    search: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
      setLoadingStates((prev) => ({ ...prev, provinces: false }));
    };

    loadProvinces();
  }, []);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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

  const handleSearch = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, search: true }));
      const response = await filterBHUser(searchValue);
      console.log("API Response:", response);

      let searchResults = [];
      if (Array.isArray(response)) {
        searchResults = response;
      } else if (response && Array.isArray(response.data)) {
        searchResults = response.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      const formattedData = searchResults.map((item) => ({
        id: item._id?.$oid || item._id,
        name: item.name,
        price: formatAmount(item.priceRange),
        detail: item.address?.province || "No address provided",
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0,
        img: item.images?.find((img) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || "",
        updatedAt: item.updatedAt,
      }));

      if (formattedData.length > 0) {
        setSearchResults(formattedData);
        toast.success(`Founded boarding houses!`);
      } else {
        setSearchResults([]);
        toast.warning("No results found.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(error.message || "Search failed. Please try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, search: false }));
    }
  };
  const handleClear = async () => {
    try {
      form.resetFields(); // Reset tất cả các trường trong form
      setSearchValue({}); // Reset giá trị tìm kiếm

      // Gọi API để lấy toàn bộ danh sách nhà trọ
      const response = await filterBHUser({});

      let allResults = [];
      if (Array.isArray(response)) {
        allResults = response;
      } else if (response && Array.isArray(response.data)) {
        allResults = response.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      const formattedData = allResults.map((item) => ({
        id: item._id?.$oid || item._id,
        name: item.name,
        price: formatAmount(item.priceRange),
        detail: item.address?.province || "No address provided",
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0,
        img: item.images?.find((img) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || "",
        updatedAt: item.updatedAt,
      }));

      setSearchResults(formattedData);
    } catch (error) {
      console.error("Clear failed:", error);
      toast.error("Không thể lấy dữ liệu. Vui lòng thử lại.");
    }
  };
  return (
    <Form form={form} className="md:max-w-[1200px] mx-auto" layout="vertical">
      <Row gutter={12} align="bottom">
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Province" name="province">
            <Select
              size="large"
              placeholder="Select province"
              onChange={handleProvinceChange}
              allowClear
              loading={loadingStates.provinces}
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
          <Form.Item label="District" name="district">
            <Select
              size="large"
              placeholder="Select district"
              onChange={handleDistrictChange}
              allowClear
              loading={loadingStates.districts}
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
          <Form.Item label="Ward" name="ward">
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
                <Option key={ward.code} value={ward.name}>
                  {ward.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={3}>
          <Form.Item>
            <Button
              size="large"
              type="primary"
              block
              onClick={handleSearch}
              loading={loadingStates.search}
            >
              Search
            </Button>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Form.Item>
            <Button
              size="large"
              type="default"
              block
              onClick={handleClear}
            >
              Clear
            </Button>
          </Form.Item>
        </Col>
        {isMobile && (
          <Col xs={24} sm={12} md={3} >
            <Form.Item>
              <FilterBoardingHouseUser setFilterValue={setSearchResults} />
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default SearchBar;