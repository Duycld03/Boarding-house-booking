import { useEffect, useState } from "react";
import { Form, Input, Select, Slider } from "antd";
import ButtonCustom from "../../../component/Button";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../../api/apiAddress";
import {
  getAllBoardingHouseTypes,
  getMaxPriceBH,
} from "../../../api/BoardingHManagement";
import formatAmount from "../../../utils/formatAmount";

const { Option } = Select;

function FilterBoardingHouse({ setFilterValue }) {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseType, setBoardingHouseType] = useState([]);
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
      province: province?.name,
      district: null,
      ward: null,
    }));
    form.setFieldsValue({ district: null, ward: null });

    if (province) {
      setLoadingStates((prev) => ({ ...prev, districts: true }));
      const districtsData = await fetchDistricts(province?.code);
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
      const wardsData = await fetchWards(district?.code);
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

  return (
    <div className="relative inline-block text-left">
      <ButtonCustom
        onClick={() => setIsOpen((prev) => !prev)}
        size="large"
        title="Filter"
        btnFilter
      />
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="py-4 px-6"
          >
            <Form.Item label="Boarding House Name" name="name" className="mb-2">
              <Input
                placeholder="Enter boarding house name"
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, name: e.target.value }));
                }}
              />
            </Form.Item>
            <Form.Item label="Province" name="province" className="mb-2">
              <Select
                placeholder="Select province"
                onChange={(code) => {
                  const selectedProvince = provinces?.find(
                    (province) => province.code === code
                  );
                  handleProvinceChange(selectedProvince);
                }}
                allowClear
                loading={loadingStates.provinces}
              >
                {provinces?.map((province) => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="District" name="district" className="mb-2">
              <Select
                placeholder="Select district"
                onChange={(code) => {
                  const selectedDistrict = districts?.find(
                    (district) => district.code === code
                  );
                  handleDistrictChange(selectedDistrict);
                }}
                allowClear
                loading={loadingStates.districts}
              >
                {districts?.map((district) => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Ward" name="ward" className="mb-2">
              <Select
                placeholder="Select ward"
                onChange={(code) => {
                  const selectedWard = wards?.find(
                    (ward) => ward.code === code
                  );
                  setFilters((prev) => ({ ...prev, ward: selectedWard?.name }));
                }}
                allowClear
                loading={loadingStates.wards}
              >
                {wards?.map((ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Price Range" name="priceRange" className="mb-2">
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

            <Form.Item
              label="Boarding House Type"
              name="boardingHouseType"
              className="mb-2"
            >
              <Select
                placeholder="Select boarding house type"
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, boardingHouseType: value }))
                }
                allowClear
              >
                {boardingHouseType?.map((type, index) => (
                  <Option key={type.index} value={type.value}>
                    {type.label}
                  </Option>
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
                />
                <ButtonCustom
                  onClick={handleClear}
                  btnDelete
                  size="large"
                  className="w-40"
                />
              </div>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default FilterBoardingHouse;
