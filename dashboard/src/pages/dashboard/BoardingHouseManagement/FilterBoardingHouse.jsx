import { useEffect, useState } from "react";
import { Form, Input, Select, Slider, ConfigProvider } from "antd";
import ButtonCustom from "../../../component/Button";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../../api/apiAddress";
import {
  getAllBoardingHouseTypes,
  getMaxPriceBH,
} from "../../../api/BoardingHouseAPI";
import formatAmount from "../../../utils/formatAmount";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/themeContext";
import coverBhType from "@/utils/coverBhType";
import i18n from "i18next";
const { Option } = Select;

function FilterBoardingHouse({ setFilterValue }) {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseType, setBoardingHouseType] = useState([]);
  const { darkMode } = useTheme();
  const { t } = useTranslation("filterBH");
  const currentLanguage = i18n.language;

  const [priceRangeValue, setPriceRangeValue] = useState({
    min: 0,
    max: 100000000000000,
  });

  const [currentPrice, setCurrentPrice] = useState({
    min: 0,
    max: priceRangeValue?.max,
  });
  const [filters, setFilters] = useState({
    name: null,
    province: null,
    district: null,
    ward: null,
    priceRange: [priceRangeValue.min, priceRangeValue.max],
    boardingHouseType: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });
  const fetchBHTypes = async () => {
    try {
      const btType = await getAllBoardingHouseTypes();
      setBoardingHouseType(btType?.data);
    } catch (error) {
      console.error("Error fetching boarding house types:", error);
    }
  };
  const fetchMaxPrice = async () => {
    try {
      const res = await getMaxPriceBH();
      if (res) {
        const maxPrice = res.maxPrice;
        setPriceRangeValue({
          min: 0,
          max: maxPrice,
        });
        setCurrentPrice({
          min: 0,
          max: maxPrice,
        });
      }
    } catch (error) {
      console.log("Có lỗi xảy ra khi lấy giá tối đa!", error);
    }
  };

  const handleSliderChange = (value) => {
    setCurrentPrice({
      min: value[0],
      max: value[1],
    });
  };

  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
      setLoadingStates((prev) => ({ ...prev, provinces: false }));
    };
    fetchBHTypes();
    fetchMaxPrice();
    loadProvinces();
  }, []);

  const handleProvinceChange = async (province) => {
    setFilters((prev) => ({
      ...prev,
      province: {
        id: province.id,
        name: province.name,
        name_en: province.name_en,
      },
      district: null,
      ward: null,
    }));

    form.setFieldsValue({ district: null, ward: null });

    if (province) {
      setLoadingStates((prev) => ({ ...prev, districts: true }));
      const districtsData = await fetchDistricts(province?.id);
      setDistricts(districtsData);
      setWards([]);
      setLoadingStates((prev) => ({ ...prev, districts: false }));
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = async (district) => {
    setFilters((prev) => ({
      ...prev,
      district: district?.name, // Lưu tên huyện
      ward: null,
    }));
    form.setFieldsValue({ ward: null });
    if (district) {
      setLoadingStates((prev) => ({ ...prev, wards: true }));
      const wardsData = await fetchWards(district?.id);
      setWards(wardsData);
      setLoadingStates((prev) => ({ ...prev, wards: false }));
    } else {
      setWards([]);
    }
  };

  const handleSubmit = (values) => {
    setFilterValue(filters);
  };

  const handleClear = () => {
    setFilters({
      name: null,
      province: null,
      district: null,
      ward: null,
      priceRange: [priceRangeValue.min, priceRangeValue.max],
      boardingHouseType: null,
    });
    setFilterValue({
      name: null,
      province: null,
      district: null,
      ward: null,
      priceRange: [priceRangeValue.min, priceRangeValue.max],
      boardingHouseType: null,
    });

    setCurrentPrice({
      min: 0,
      max: priceRangeValue.max,
    });

    form.resetFields();
    form.setFieldsValue({
      name: "",
      province: undefined,
      district: undefined,
      ward: undefined,
      priceRange: [priceRangeValue.min, priceRangeValue.max],
      boardingHouseType: undefined,
    });
  };
  const themeConfig = {
    algorithm: darkMode
      ? ConfigProvider.darkAlgorithm
      : ConfigProvider.defaultAlgorithm,
    token: darkMode
      ? {
        colorText: "#ffffff", // Văn bản sáng
        colorTextSecondary: "#e5e7eb", // Văn bản phụ nhạt hơn
        colorBgContainer: "#1f2937", // Nền tối
        colorBorder: "#4b5563", // Viền rõ hơn
        colorPrimary: "#3b82f6", // Màu chính (xanh lam)

        // Thiết lập màu sắc cho Input
        colorBgElevated: "#374151", // Nền cho các thành phần thả xuống
        colorFillSecondary: "#374151", // Nền cho các ô input
        colorTextPlaceholder: "#9CA3AF", // Văn bản placeholder
        colorBorderSecondary: "#4B5563", // Viền phụ
        controlItemBgActive: "#3b82f6", // Nền khi được chọn
        controlItemBgHover: "#4B5563", // Nền khi hover
      }
      : {
        colorText: "#000", // Văn bản tối
        colorTextSecondary: "#4b5563", // Văn bản phụ
        colorBgContainer: "#ffffff", // Nền sáng
        colorBorder: "#d9d9d9", // Viền nhạt
        colorPrimary: "#3b82f6", // Màu chính (xanh lam)

        // Thiết lập màu sắc cho Input
        colorBgElevated: "#f5f5f5", // Nền cho các thành phần thả xuống
        colorFillSecondary: "#f5f5f5", // Nền cho các ô input
        colorTextPlaceholder: "#9CA3AF", // Văn bản placeholder
        colorBorderSecondary: "#d9d9d9", // Viền phụ
        controlItemBgActive: "#e5e7eb", // Nền khi được chọn
        controlItemBgHover: "#f0f0f0", // Nền khi hover
      },
    components: {
      // Cấu hình cho Select
      Select: {
        selectorBg: darkMode ? "#374151" : "#f5f5f5", // Nền của Select
        colorText: darkMode ? "#F9FAFB" : "#000", // Văn bản trong Select
        colorBorder: darkMode ? "#4B5563" : "#d9d9d9", // Viền
        optionSelectedBg: darkMode ? "#2563eb" : "#e5e7eb", // Nền khi được chọn
        optionHoverBg: darkMode ? "#4B5563" : "#f0f0f0", // Nền khi hover
      },
      // Cấu hình cho Input
      Input: {
        colorBgContainer: darkMode ? "#374151" : "#f5f5f5", // Nền Input
        colorText: darkMode ? "#F9FAFB" : "#000", // Văn bản trong Input
        colorBorder: darkMode ? "#4B5563" : "#d9d9d9", // Viền
        colorTextPlaceholder: darkMode ? "#9CA3AF" : "#4B5563", // Placeholder
      },
      // Cấu hình cho Form
      Form: {
        labelColor: darkMode ? "#F9FAFB" : "#000", // Màu nhãn Form
      },
    },
  };
  return (
    <ConfigProvider theme={themeConfig}>
      <div className="relative inline-block text-left">
        <ButtonCustom
          onClick={() => setIsOpen((prev) => !prev)}
          size="large"
          title={t("filterBH.filter")}
          btnFilter
        />
        {isOpen && (
          <div
            className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
              }`}
          >
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="py-4 px-6"
            >
              <Form.Item label={t("filterBH.boardingHouseName")} name="name" className="mb-2">
                <Input
                  placeholder={t("filterBH.enterBoardingHouseName")}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, name: e.target.value }));
                  }}
                />
              </Form.Item>
              <Form.Item label={t("filterBH.province")} name="province" className="mb-2">
                <Select
                  placeholder={t("filterBH.selectProvince")}
                  onChange={(id) => {
                    const selectedProvince = provinces?.find(
                      (province) => province.id === id
                    );
                    handleProvinceChange(selectedProvince);
                  }}
                  allowClear
                  loading={loadingStates.provinces}
                >
                  {provinces?.map((province) => (
                    <Option key={province.id} value={province.id}>
                      {currentLanguage === "vi" ? province.name : province.name_en}
                    </Option>
                  ))}

                </Select>
              </Form.Item>

              <Form.Item label={t("filterBH.district")} name="district" className="mb-2">
                <Select
                  placeholder={t("filterBH.selectDistrict")}
                  onChange={(id) => {
                    const selectedDistrict = districts?.find(
                      (district) => district.id === id
                    );
                    handleDistrictChange(selectedDistrict);
                  }}
                  allowClear
                  loading={loadingStates.districts}
                >
                  {districts?.map((district) => (
                    <Option key={district.id} value={district.id}>
                      {currentLanguage === "vi" ? district.name : district.name_en}
                    </Option>
                  ))}

                </Select>
              </Form.Item>

              <Form.Item label={t("filterBH.ward")} name="ward" className="mb-2">
                <Select
                  placeholder={t("filterBH.selectWard")}
                  onChange={(id) => {
                    const selectedWard = wards?.find(
                      (ward) => ward.id === id
                    );
                    setFilters((prev) => ({ ...prev, ward: selectedWard?.name }));
                  }}
                  allowClear
                  loading={loadingStates.wards}
                >
                  {wards?.map((ward) => (
                    <Option key={ward.id} value={ward.id}>
                      {currentLanguage === "vi" ? ward.name : ward.name_en}
                    </Option>
                  ))}

                </Select>
              </Form.Item>

              <Form.Item label={t("filterBH.priceRange")} name="priceRange" className="mb-2">
                <div className="flex justify-between text-2xl mt-1 mb-2">
                  <p className="truncate max-w-[40%]">
                    min: {formatAmount(currentPrice.min)}
                  </p>
                  <p className="truncate max-w-[40%] text-right">
                    max: {formatAmount(currentPrice.max)}
                  </p>
                </div>

                <Slider
                  range
                  min={priceRangeValue.min}
                  max={priceRangeValue.max}
                  defaultValue={[priceRangeValue.min, priceRangeValue.max]}
                  onChange={(value) => {
                    handleSliderChange(value);
                    setFilters((prev) => ({ ...prev, priceRange: value }));
                  }}
                />
              </Form.Item>

              <Form.Item label={t("filterBH.boardingHouseType")} name="boardingHouseType" className="mb-2">
                <Select
                  placeholder={t("filterBH.selectBoardingHouseType")}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, boardingHouseType: value }))
                  }
                  allowClear
                >
                  {boardingHouseType.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {coverBhType(type.code, currentLanguage)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <div className="flex justify-evenly mt-4">
                  <ButtonCustom
                    btnFilter
                    size="large"
                    htmlType="submit"
                    className="w-40"
                    title={t("filterBH.filterButton")}
                  />
                  <ButtonCustom
                    onClick={handleClear}
                    btnDelete
                    size="large"
                    className="w-40"
                    title={t("filterBH.deleteButton")}
                  />
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default FilterBoardingHouse;
