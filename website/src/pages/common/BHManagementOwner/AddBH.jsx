import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddressSelector from "../../../component/AddressSelector";
import { getAllBoardingHouseTypesOwner } from "../../../api/BoardingHManagement";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../../api/apiAddress";
import { Button } from "../../../component";
import {
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  Modal,
  Spin,
  ConfigProvider
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createBoardingHouseOwner } from "../../../api/BoardingHManagement";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/themeContext";
import Style from "./AddBH.module.css";
import classNames from "classnames";
const AddBHModal = ({ onAddData }) => {
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false); // Controls modal visibility
  const [formData, setFormData] = useState({
    boardingHouseType: "",
    name: "",
    address: {
      province: "",
      district: "",
      ward: "",
      detail: "",
    },
    description: "",
    primaryImage: null,
    otherImages: [],
    priceRange: "",
    electricityPrice: "",
    waterPrice: "",
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
  const [geoLocation, setGeoLocation] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation("addBH");
  // Function to reset form data
  const resetFormData = () => {
    setFormData({
      boardingHouseType: "",
      name: "",
      address: {
        province: "",
        district: "",
        ward: "",
        detail: "",
      },
      description: "",
      primaryImage: null,
      otherImages: [],
      priceRange: "",
      electricityPrice: "",
      waterPrice: "",
    });
    setDistricts([]); // Clear districts
    setWards([]); // Clear wards
  };

  // Open modal and reset form
  const openModal = () => {
    resetFormData(); // Clear form data
    setIsModalVisible(true); // Open modal
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false); // Close modal
  };

  // Fetch provinces, districts, and wards dynamically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const provincesData = await fetchProvinces();
        setProvinces(provincesData);

        if (formData?.address?.province) {
          const selectedProvince = provincesData.find(
            (p) => p.name === formData.address.province
          );
          if (selectedProvince) {
            const districtsData = await fetchDistricts(selectedProvince.code);
            setDistricts(districtsData);
            setWards([]);

            if (formData?.address?.district) {
              const selectedDistrict = districtsData.find(
                (d) => d.name === formData.address.district
              );
              if (selectedDistrict) {
                const wardsData = await fetchWards(selectedDistrict.code);
                setWards(wardsData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [formData?.address?.province, formData?.address?.district]);

  const fetchBoardingHouseTypes = async () => {
    try {
      const response = await getAllBoardingHouseTypesOwner();
      setBoardingHouseTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch boarding house types:", error);
      toast.error("Failed to fetch boarding house types.");
    }
  };

  useEffect(() => {
    fetchBoardingHouseTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length === 2) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const uploadOtherImgProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, false);
      return false;
    },
    multiple: true,
    accept: "image/*",
  };

  const uploadProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, true);
      return false;
    },
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
  };

  const handleFileChange = (e, isPrimary = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isPrimary) {
      setFormData((prev) => ({ ...prev, primaryImage: file }));
    } else {
      setFormData((prev) => ({
        ...prev,
        otherImages: [...prev.otherImages, file],
      }));
    }
  };

  const handleRemoveOtherImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePrimaryImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      primaryImage: null,
    }));
  };

  const getLocation = async () => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            format: "json",
            q: `${formData.address.ward}, ${formData.address.district}, ${formData.address.province}`,
            polygon_geojson: 1,
          },
        }
      );
      setGeoLocation(res.data[0]);
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  useEffect(() => {
    getLocation();
  }, [formData?.address?.ward]);

  const handleSubmit = async () => {
    try {
      setLoading(true); // Show loading spinner

      const payload = new FormData();
      if (!formData.boardingHouseType) {
        toast.error("Please select a boarding house type.");
        return;
      }
      if (!formData.name) {
        toast.error("Please enter a boarding house name.");
        return;
      }
      if (!formData.address.province) {
        toast.error("Please select a boarding house province.");
        return;
      }
      if (!formData.address.district) {
        toast.error("Please select a boarding house district.");
        return;
      }
      if (!formData.address.ward) {
        toast.error("Please select a boarding house ward.");
        return;
      }
      if (!formData.address.detail) {
        toast.error("Please enter a boarding house details.");
        return;
      }
      if (!formData.primaryImage) {
        toast.error("You must upload a primary image.");
        return;
      }
      if (!formData.priceRange) {
        toast.error("Please enter price range.");
        return;
      }
      if (!formData.electricityPrice) {
        toast.error("Please enter electricity price.");
        return;
      }
      if (!formData.waterPrice) {
        toast.error("Please enter water price.");
        return;
      }
      if (!geoLocation) {
        toast.error("Please mark the location on the map.");
        return;
      }

      payload.append("boardingHouseType", formData.boardingHouseType);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("priceRange", formData.priceRange);
      payload.append("electricityPrice", formData.electricityPrice);
      payload.append("waterPrice", formData.waterPrice);
      payload.append("address[province]", formData.address.province);
      payload.append("address[district]", formData.address.district);
      payload.append("address[ward]", formData.address.ward);
      payload.append("address[detail]", formData.address.detail);
      payload.append("location[lat]", geoLocation.lat);
      payload.append("location[lon]", geoLocation.lon);

      // Ensure only one primary image and a maximum of 15 other images
      const allImages = [];
      if (formData.primaryImage) allImages.push(formData.primaryImage);
      if (formData.otherImages.length > 15) {
        toast.error("You can't upload more than 15 other images.");
        return;
      }
      allImages.push(...formData.otherImages);

      if (allImages.length === 0) {
        toast.error("You must upload at least one image.");
        return;
      }

      allImages.forEach((file, index) => {
        payload.append("boardingHouse", file);
      });

      const response = await createBoardingHouseOwner(payload);

      if (response?.message === "Boarding house created successfully!") {
        toast.success(response.message);
        onAddData(); // Refresh parent data
        closeModal(); // Close modal
      } else {
        throw new Error(response?.message || "Failed to add boarding house.");
      }
    } catch (error) {
      console.error("Error submitting boarding house:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to submit the form."
      );
    } finally {
      setGeoLocation(null); // Reset location
      setLoading(false); // Hide loading spinner
    }
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
      <>
        {/* Trigger Button */}
        <Button
          btnAdd
          title="Add Boarding House"
          size="large"
          onClick={openModal} // Open modal and reset form
          className={darkMode ? "dark-button" : ""}
        />

        {/* Outer Modal */}
        <Modal
          title="Create Boarding House"
          open={isModalVisible}
          onCancel={closeModal} // Close modal
          footer={null}
          destroyOnClose
          className={darkMode ? "dark-modal" : ""}
        >
          <Form
            layout="vertical"
            onSubmitCapture={handleSubmit}
            className={`rounded-lg w-full max-w-3xl ${darkMode ? "dark-form bg-dark" : "bg-white"
              }`}
          >
            <h2
              className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-black"
                }`}
            >
              1. Information
            </h2>
            {/* Boarding House Type */}
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  Boarding House Type
                </span>
              }
              name="boardingHouseType"
              rules={[
                {
                  required: true,
                  message: "Please select a boarding house type",
                },
              ]}
              className="mb-2"
            >
              <Select
                placeholder="Select Type"
                value={formData.boardingHouseType}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, boardingHouseType: value }))
                }
                className={darkMode ? "dark-select" : ""}
              >
                {boardingHouseTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Boarding House Name */}
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  Boarding House Name
                </span>
              }
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter the boarding house name",
                },
              ]}
              className="mb-2"
            >
              <Input
                placeholder="Enter boarding house name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={darkMode ? "dark-input" : ""}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>Description</span>
              }
              name="description"
              className="mb-2"
            >
              <Input.TextArea
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={darkMode ? "dark-input" : ""}
              />
            </Form.Item>

            <h2
              className={`text-3xl font-bold mb-4 mt-10 ${darkMode ? "text-white" : "text-black"
                }`}
            >
              2. Address
            </h2>
            {/* Address Selector */}
            <AddressSelector
              provinces={provinces}
              districts={districts}
              wards={wards}
              onProvinceChange={handleInputChange}
              onDistrictChange={handleInputChange}
              onInputChange={handleInputChange}
              formData={formData}
              location={geoLocation}
              setGeoLocation={setGeoLocation}
              darkMode={darkMode} // Passing darkMode to AddressSelector
            />

            <h2
              className={`text-3xl font-bold mb-4 mt-10 ${darkMode ? "text-white" : "text-black"
                }`}
            >
              3. Image
            </h2>
            {/* Primary Image */}
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>Primary Image</span>
              }
              className="mb-4"
            >
              <div className="flex flex-col gap-4">
                {!formData.primaryImage && (
                  <Upload
                    {...uploadProps}
                    name="boardingHouse"
                    listType="picture-card"
                    showUploadList={false}
                    className={`custom-upload ${darkMode ? "dark-upload" : "w-full max-w-lg"
                      }`}
                  >
                    <div
                      className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-6 ${darkMode
                        ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700"
                        : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
                        } transition`}
                    >
                      <PlusOutlined
                        className={`text-2xl ${darkMode ? "text-gray-400" : "text-gray-400"
                          }`}
                      />
                      <p
                        className={`mt-2 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        Add Image
                      </p>
                      <p
                        className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                      >
                        Drag-drop or click here to choose a file
                      </p>
                    </div>
                  </Upload>
                )}

                {formData.primaryImage && (
                  <div className="items-center justify-center flex flex-col gap-4">
                    <Image
                      src={URL.createObjectURL(formData.primaryImage)}
                      alt="Primary"
                      className="object-cover border rounded"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "300px",
                      }}
                      preview={{
                        mask: (
                          <span
                            className={`${darkMode ? "text-white" : "text-black"
                              }`}
                          >
                            Preview
                          </span>
                        ),
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemovePrimaryImage}
                      className={`absolute top-2 right-2 ${darkMode
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-red-500 hover:bg-red-600"
                        } text-white text-xs px-3 py-1 rounded-full z-10 shadow-lg`}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            </Form.Item>
            {/* Other Images */}
            <Form.Item label={<span>Other Images</span>} className="mb-4">
              <div className="mt-4 flex flex-wrap gap-4">
                {formData.otherImages.map((file, index) => (
                  <div key={index} className="relative">
                    {/* Hiển thị ảnh bằng Ant Design Image */}
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Other ${index + 1}`}
                      name="boardingHouse"
                      className="object-cover border rounded"
                      width={100}
                      height={100}
                      preview={{
                        mask: <span>Preview</span>,
                      }}
                    />
                    {/* Nút delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                    >
                      X
                    </button>
                  </div>
                ))}

                {/* Upload component */}
                <Upload
                  {...uploadOtherImgProps}
                  listType="picture-card"
                  showUploadList={false}
                  className="custom-upload"
                >
                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                    <PlusOutlined className="text-2xl text-gray-400" />
                    <p className="text-gray-500 mt-2 text-sm font-medium">
                      Add Images
                    </p>
                    <p className="text-gray-400 text-xs">
                      Drag-drop or click here to choose a file
                    </p>
                  </div>
                </Upload>
              </div>
              {/* thêm css để bỏ đường viền khung của antd*/}
              <style>
                {`
                            .custom-upload .ant-upload
                            {
                            border: none !important;
                            background: none !important;
                            padding: 0 !important;
                            }
                        `}
              </style>
            </Form.Item>
            <h2
              className={`text-3xl font-bold mb-4 mt-10 ${darkMode ? "text-white" : "text-black"
                }`}
            >
              4. Price
            </h2>
            {/* Price Range */}
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  Price Rent/month (VND)
                </span>
              }
              name="priceRange"
              rules={[
                { required: true, message: "Please enter the price rent" },
              ]}
              className="mb-2"
            >
              <InputNumber
                placeholder="Enter price rent"
                name="priceRange"
                value={formData.priceRange}
                onChange={(value) =>
                  handleInputChange({ target: { name: "priceRange", value } })
                }
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                className={darkMode ? "dark-input w-full" : "w-full"}
                min={0}
              />
            </Form.Item>

            <div className="flex justify-end mt-4">
              <Button
                title="Cancel"
                btnCancel={true}
                onClick={closeModal}
                className={`${darkMode
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-red-500 hover:bg-red-600"
                  } text-white mr-2`}
                size="large"
              >
                Cancel
              </Button>
              <Button
                className={`${darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-primary hover:bg-blue-500"
                  } text-white flex items-center`}
                size="large"
                onClick={handleSubmit}
                title="Submit"
                loading={loading}
              >
                {loading ? <Spin size="small" className="mr-2" /> : null} Submit
              </Button>
            </div>
          </Form>
        </Modal>
      </>
    </ConfigProvider>
  );
};

export default AddBHModal;
