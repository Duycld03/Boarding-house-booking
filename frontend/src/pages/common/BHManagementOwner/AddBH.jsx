import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AddressSelector from '../../../component/AddressSelector';
import { getAllBoardingHouseTypesOwner } from '../../../api/BoardingHManagement';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from '../../../api/apiAddress';
import { Button } from '../../../component';
import {
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  Modal,
  Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createBoardingHouseOwner } from '../../../api/BoardingHManagement';

const AddBHModal = ({ onAddData }) => {
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false); // Controls modal visibility
  const [formData, setFormData] = useState({
    boardingHouseType: '',
    name: '',
    address: {
      province: '',
      district: '',
      ward: '',
      detail: '',
    },
    description: '',
    primaryImage: null,
    otherImages: [],
    priceRange: '',
    electricityPrice: '',
    waterPrice: '',
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);

  // Function to reset form data
  const resetFormData = () => {
    setFormData({
      boardingHouseType: '',
      name: '',
      address: {
        province: '',
        district: '',
        ward: '',
        detail: '',
      },
      description: '',
      primaryImage: null,
      otherImages: [],
      priceRange: '',
      electricityPrice: '',
      waterPrice: '',
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
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [formData?.address?.province, formData?.address?.district]);

  const fetchBoardingHouseTypes = async () => {
    try {
      const response = await getAllBoardingHouseTypesOwner();
      setBoardingHouseTypes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch boarding house types:', error);
      toast.error('Failed to fetch boarding house types.');
    }
  };

  useEffect(() => {
    fetchBoardingHouseTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
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
    accept: 'image/*',
  };

  const uploadProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, true);
      return false;
    },
    accept: 'image/*',
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

  const handleSubmit = async () => {
    try {
      setLoading(true); // Show loading spinner

      const payload = new FormData();
      if (!formData.boardingHouseType) {
        toast.error('Please select a boarding house type.');
        return;
      }
      if (!formData.name) {
        toast.error('Please enter a boarding house name.');
        return;
      }
      if (!formData.address.province) {
        toast.error('Please select a boarding house province.');
        return;
      }
      if (!formData.address.district) {
        toast.error('Please select a boarding house district.');
        return;
      }
      if (!formData.address.ward) {
        toast.error('Please select a boarding house ward.');
        return;
      }
      if (!formData.address.detail) {
        toast.error('Please enter a boarding house details.');
        return;
      }
      payload.append('boardingHouseType', formData.boardingHouseType);
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('priceRange', formData.priceRange);
      payload.append('electricityPrice', formData.electricityPrice);
      payload.append('waterPrice', formData.waterPrice);
      payload.append('address[province]', formData.address.province);
      payload.append('address[district]', formData.address.district);
      payload.append('address[ward]', formData.address.ward);
      payload.append('address[detail]', formData.address.detail);

      // Ensure only one primary image and a maximum of 15 other images
      const allImages = [];
      if (formData.primaryImage) allImages.push(formData.primaryImage);
      if (formData.otherImages.length > 15) {
        toast.error("You can't upload more than 15 other images.");
        return;
      }
      allImages.push(...formData.otherImages);

      if (allImages.length === 0) {
        toast.error('You must upload at least one image.');
        return;
      }

      allImages.forEach((file, index) => {
        payload.append('boardingHouse', file);
      });

      const response = await createBoardingHouseOwner(payload);

      if (response?.message === 'Boarding house created successfully!') {
        toast.success(response.message);
        onAddData(); // Refresh parent data
        closeModal(); // Close modal
      } else {
        throw new Error(response?.message || 'Failed to add boarding house.');
      }
    } catch (error) {
      console.error('Error submitting boarding house:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to submit the form.'
      );
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        btnAdd
        title="Add Boarding House"
        size="large"
        onClick={openModal} // Open modal and reset form
      />

      {/* Outer Modal */}
      <Modal
        title="Create Boarding House"
        open={isModalVisible}
        onCancel={closeModal} // Close modal
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onSubmitCapture={handleSubmit}
          className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-4 ">1. Information</h2>
          {/* Boarding House Type */}
          <Form.Item
            label="Boarding House Type"
            name="boardingHouseType"
            rules={[
              {
                required: true,
                message: 'Please select a boarding house type',
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
            label="Name Boarding House"
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter the boarding house name',
              },
            ]}
            className="mb-2"
          >
            <Input
              placeholder="Enter boarding house name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Form.Item>
          {/* Description */}
          <Form.Item label="Description" name="description" className="mb-2">
            <Input.TextArea
              placeholder="Enter description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </Form.Item>

          <h2 className="text-3xl font-bold mb-4 mt-10 ">2. Address</h2>
          {/* Address Selector */}
          <AddressSelector
            provinces={provinces}
            districts={districts}
            wards={wards}
            onProvinceChange={handleInputChange}
            onDistrictChange={handleInputChange}
            onInputChange={handleInputChange}
            formData={formData}
          />
          <h2 className="text-3xl font-bold mb-4 mt-10 ">3. Image</h2>
          {/* Primary Image */}
          <Form.Item label={<span>Primary Image</span>} className="mb-4">
            <div className="flex flex-col gap-4">
              {/* Nút Upload Primary Image */}
              {!formData.primaryImage && (
                <Upload
                  {...uploadProps}
                  name="boardingHouse"
                  listType="picture-card"
                  showUploadList={false}
                  className="custom-upload w-full max-w-lg"
                >
                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                    <PlusOutlined className="text-2xl text-gray-400" />
                    <p className="text-gray-500 mt-2 text-sm font-medium">
                      Add Image
                    </p>
                    <p className="text-gray-400 text-xs">
                      Drag-drop or click here to choose a file
                    </p>
                  </div>
                </Upload>
              )}

              {/* Hiển thị Primary Image nếu đã upload */}
              {formData.primaryImage && (
                <div className="items-center justify-center flex flex-col gap-4">
                  <Image
                    src={URL.createObjectURL(formData.primaryImage)}
                    alt="Primary"
                    className="object-cover border rounded"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                    }}
                    preview={{
                      mask: <span className="text-white">Preview</span>,
                    }}
                  />
                  {/* Nút xóa ảnh */}
                  <button
                    type="button"
                    onClick={handleRemovePrimaryImage}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full z-10 shadow-lg"
                  >
                    X
                  </button>
                </div>
              )}
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
          <h2 className="text-3xl font-bold mb-4 mt-10 ">4. Price</h2>
          {/* Price Range */}
          <Form.Item
            label="Price Rent/month (VND)"
            name="priceRange"
            rules={[{ required: true, message: 'Please enter the price rent' }]}
            className="mb-2"
          >
            <InputNumber
              placeholder="Enter price rent"
              name="priceRange"
              value={formData.priceRange}
              onChange={(value) =>
                handleInputChange({ target: { name: 'priceRange', value } })
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              } // Thêm dấu phẩy ngăn cách hàng nghìn
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')} // Loại bỏ dấu phẩy khi nhập
              className="w-full"
              min={0}
            />
          </Form.Item>

          {/* Electricity Price */}
          <Form.Item
            label="Electricity Price/kWh (VND)"
            name="electricityPrice"
            rules={[
              { required: true, message: 'Please enter the electricity price' },
            ]}
            className="mb-2"
          >
            <InputNumber
              placeholder="Enter electricity price"
              name="electricityPrice"
              value={formData.electricityPrice}
              onChange={(value) =>
                handleInputChange({
                  target: { name: 'electricityPrice', value },
                })
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              className="w-full"
              min={0}
            />
          </Form.Item>

          {/* Water Price */}
          <Form.Item
            label="Water Price/m³ (VND)"
            name="waterPrice"
            rules={[
              { required: true, message: 'Please enter the water price' },
            ]}
            className="mb-2"
          >
            <InputNumber
              placeholder="Enter water price"
              name="waterPrice"
              value={formData.waterPrice}
              onChange={(value) =>
                handleInputChange({ target: { name: 'waterPrice', value } })
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              className="w-full"
              min={0}
            />
          </Form.Item>
          {/* Total Rooms */}
          {/* <Form.Item
                    label="Total Rooms"
                    name="totalRooms"
                    rules={[{ required: true, message: "Please enter the total number of rooms" }]}
                    className="mb-2"
                >
                    <Input
                        type="number"
                        placeholder="Enter total rooms"
                        name="totalRooms"
                        value={formData.totalRooms}
                        onChange={handleInputChange}
                    />
                </Form.Item>

                {/* Available Rooms */}
          {/* <Form.Item
                    label="Available Rooms"
                    name="availableRooms"
                    rules={[{ required: true, message: "Please enter the available rooms" }]}
                    className="mb-2"
                >
                    <Input
                        type="number"
                        placeholder="Enter available rooms"
                        name="availableRooms"
                        value={formData.availableRooms}
                        onChange={handleInputChange}
                    />
                </Form.Item> */}

          <div className="flex justify-end mt-4">
            <Button
              title="Cancel"
              btnCancel={true}
              onClick={closeModal}
              className="bg-red-500 hover:bg-red-600 text-white mr-2"
              size="large"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-white flex items-center"
              size="large"
              onClick={handleSubmit}
              title="Submit"
              disabled={loading} // Disable button when loading
            >
              {loading ? <Spin size="small" className="mr-2" /> : null} Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddBHModal;
