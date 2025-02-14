import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  Modal,
  Button,
} from 'antd';
import {
  PlusOutlined,
  HeartFilled,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import AddressSelector from '../../../component/AddressSelector';
import { getAllBoardingHouseTypesOwner } from '../../../api/BoardingHManagement';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from '../../../api/apiAddress';
import { updateBoardingHouseDetailsOwner } from '../../../api/BoardingHManagement';

const UpdateBHModal = ({ open, onCancel, formData, onUpdate }) => {
  const [updatedData, setUpdatedData] = useState(null); // Updated form data
  const [loading, setLoading] = useState(false); // Loading state
  const [provinces, setProvinces] = useState([]); // Provinces list
  const [districts, setDistricts] = useState([]); // Districts list
  const [wards, setWards] = useState([]); // Wards list
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]); // House types
  const [images, setImages] = useState([]); // Images from backend

  // Initialize form data and images when `formData` changes
  useEffect(() => {
    if (formData) {
      setUpdatedData({ ...formData });
      setImages(formData.images || []);
    } else {
      setUpdatedData(null);
      setImages([]);
    }
  }, [formData]);

  // Fetch provinces, districts, and wards
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const provincesData = await fetchProvinces();
        setProvinces(provincesData);

        if (updatedData?.address?.province) {
          const selectedProvince = provincesData.find(
            (p) => p.name === updatedData.address.province
          );
          if (selectedProvince) {
            const districtsData = await fetchDistricts(selectedProvince.code);
            setDistricts(districtsData);

            if (updatedData?.address?.district) {
              const selectedDistrict = districtsData.find(
                (d) => d.name === updatedData.address.district
              );
              if (selectedDistrict) {
                const wardsData = await fetchWards(selectedDistrict.code);
                setWards(wardsData);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching address data:', error);
        toast.error('Failed to fetch address data.');
      }
    };

    if (updatedData?.address?.province) {
      fetchAddressData();
    }
  }, [updatedData?.address?.province, updatedData?.address?.district]);

  // Fetch boarding house types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getAllBoardingHouseTypesOwner();
        setBoardingHouseTypes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch boarding house types:', error);
        toast.error('Failed to fetch boarding house types.');
      }
    };

    fetchTypes();
  }, []);

  // Update form data on input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length === 2) {
      setUpdatedData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setUpdatedData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle file changes for primary and other images
  const handleFileChange = (file, isPrimary = false) => {
    if (isPrimary) {
      setUpdatedData((prev) => ({ ...prev, primaryImage: file }));
    } else {
      setUpdatedData((prev) => ({
        ...prev,
        otherImages: [...(prev.otherImages || []), file],
      }));
    }
  };

  // Remove other images
  const handleRemoveOtherImage = (index) => {
    setUpdatedData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
  };

  // Remove primary image
  const handleRemovePrimaryImage = () => {
    setUpdatedData((prev) => ({
      ...prev,
      primaryImage: null,
    }));
  };

  // Delete images from backend
  const handleImageDelete = (id) => {
    setImages((prev) => prev.filter((img) => img._id !== id));
  };
  const handleSelectedTypesChange = (event) => {
    const { name, value } = event.target;
    updatedData((prevData) => ({
      ...prevData,
      [name]: { _id: value },
    }));
  };
  const uploadOtherImgProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, false);
      return false; // Prevent auto-upload
    },
    multiple: true,
    accept: 'image/*',
  };
  const uploadProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, true);
      return false; // Prevent auto-upload
    },
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
  };

  // Submit updated data
  const handleSubmit = async () => {
    if (!updatedData) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append('boardingHouseType', updatedData.boardingHouseType);
      payload.append('name', updatedData.name);
      payload.append('description', updatedData.description);
      payload.append('priceRange', updatedData.priceRange);
      payload.append('electricityPrice', updatedData.electricityPrice);
      payload.append('waterPrice', updatedData.waterPrice);
      payload.append('address[province]', updatedData.address.province);
      payload.append('address[district]', updatedData.address.district);
      payload.append('address[ward]', updatedData.address.ward);
      payload.append('address[detail]', updatedData.address.detail);

      if (updatedData.primaryImage instanceof File) {
        payload.append('primaryImage', updatedData.primaryImage);
      }

      updatedData.otherImages
        ?.filter((file) => file instanceof File)
        .forEach((file) => payload.append('otherImages', file));

      const response = await updateBoardingHouseDetailsOwner(
        updatedData._id,
        payload
      );

      if (response?.message === 'Boarding house updated successfully!') {
        toast.success(response.message);
        onUpdate(); // Notify parent to refresh data
        onCancel(); // Close modal
      } else {
        throw new Error(
          response?.message || 'Failed to update boarding house.'
        );
      }
    } catch (error) {
      console.error('Error updating boarding house:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update the boarding house.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!updatedData) {
    return null; // Do not render modal if no data
  }

  return (
    <Modal
      title="Boarding House Detail"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <h2 className="text-4xl font-bold mb-8">Boarding House Detail</h2>
        <h2 className="text-3xl font-bold mb-4">1. Owner and Information</h2>

        <Form.Item label="Name Boarding House" className="mb-2">
          <Input
            name="name"
            value={updatedData.name || ''}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Boarding House Type" className="mb-2">
          <Select
            name="boardingHouseType"
            value={updatedData.boardingHouseType?._id || ''}
            onChange={(value) =>
              handleSelectedTypesChange({
                target: {
                  name: 'boardingHouseType',
                  value,
                },
              })
            }
          >
            {boardingHouseTypes.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="col-span-2">
          <Form.Item label="Description">
            <Input.TextArea
              name="description"
              value={updatedData.description || ''}
              onChange={handleInputChange}
              rows={4}
            />
          </Form.Item>
        </div>

        <h2 className="text-3xl font-bold mb-4 mt-10 ">Address</h2>
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
        <Form.Item label="Primary Image" className="mb-4">
          <div className="flex flex-col gap-4">
            {/* Check primary Image exists */}
            {updatedData.primaryImage ||
            images?.find((img) => img.isPrimary) ? (
              <div className="relative">
                <Image
                  src={
                    updatedData.primaryImage
                      ? URL.createObjectURL(updatedData.primaryImage)
                      : `${images.find((img) => img.isPrimary)?.imageUrl}`
                  }
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
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={handleRemovePrimaryImage}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                >
                  X
                </button>
              </div>
            ) : (
              // If no primary image exists, show the upload button
              <Upload
                {...uploadProps}
                listType="picture-card"
                showUploadList={false}
                className="custom-upload"
                name="boardingHouse"
              >
                <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                  <PlusOutlined className="text-2xl text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm font-medium">
                    Add Primary Image
                  </p>
                  <p className="text-gray-400 text-xs">
                    Drag-drop or click here to choose a file
                  </p>
                </div>
              </Upload>
            )}
          </div>
        </Form.Item>

        <Form.Item label="Other Images" className="mb-4">
          <div className="mt-4 flex flex-wrap gap-4">
            {/* Display Other Images*/}
            {images
              .filter((img) => !img.isPrimary) // Exclude primary images
              .map((img) => (
                <div key={img._id} className="relative">
                  <Image
                    src={`${img.imageUrl}`}
                    alt="Other Image"
                    className="object-cover border rounded"
                    width={100}
                    height={100}
                    preview={{
                      mask: <span className="text-white">Preview</span>,
                    }}
                  />
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                  >
                    X
                  </button>
                </div>
              ))}

            {/* Display Uploaded Other Images */}
            {(updatedData.otherImages || []).map((file, index) => (
              <div key={index} className="relative group">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Other Image ${index + 1}`}
                  className="object-cover border border-gray-200 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                  width={100}
                  height={100}
                  preview={{
                    mask: <span className="text-white">Preview</span>,
                  }}
                />
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveOtherImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  X
                </button>
              </div>
            ))}

            {/* Upload Other Images */}
            <Upload
              {...uploadOtherImgProps}
              listType="picture-card"
              showUploadList={false}
              className="custom-upload"
              name="boardingHouse"
            >
              <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                <PlusOutlined className="text-2xl text-gray-400" />
                <p className="text-gray-500 mt-2 text-sm font-medium">
                  Add Primary Image
                </p>
                <p className="text-gray-400 text-xs">
                  Drag-drop or click here to choose a file
                </p>
              </div>
            </Upload>
          </div>
        </Form.Item>

        <h2 className="text-3xl font-bold mb-4 mt-10 ">4. Price</h2>
        <div>
          <Form.Item label="Price Rent/month (VND)" className="mb-2">
            <InputNumber
              name="priceRange"
              value={updatedData.priceRange || ''}
              onChange={(value) =>
                handleInputChange({ target: { name: 'priceRange', value } })
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              } // Thêm dấu phẩy ngăn cách hàng nghìn
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              className="w-full"
              min={0}
            />
          </Form.Item>

          <Form.Item label="Electricity Price/kWh (VND)" className="mb-2">
            <InputNumber
              name="electricityPrice"
              value={updatedData.electricityPrice || ''}
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

          <Form.Item label="Water Price/m³ (VND)" className="mb-2">
            <InputNumber
              name="waterPrice"
              value={updatedData.waterPrice || ''}
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
          <h2 className="text-3xl font-bold mb-4 mt-10 ">5. Room</h2>
          <Form.Item label="Total Rooms" className="mb-2">
            <InputNumber
              value={updatedData.totalRooms || '0'}
              readOnly
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Available Rooms" className="mb-2">
            <InputNumber
              value={updatedData.availableRooms || '0'}
              readOnly
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <h2 className="text-3xl font-bold mb-4 mt-10 ">6. Like and Rating</h2>
          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* like */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <HeartFilled style={{ fontSize: '24px', color: 'red' }} />
                <span style={{ fontSize: '16px', color: '#595959' }}>
                  {updatedData.likes
                    ? Number(updatedData.likes).toLocaleString('en-US') // Format big numbers with commas
                    : '0'}
                </span>
              </div>

              {/* Rating */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {Array.from({ length: 5 }, (_, index) => {
                  if (index < Math.floor(updatedData.rating || 0)) {
                    return (
                      <StarFilled
                        key={index}
                        style={{ fontSize: '24px', color: '#FFD700' }}
                      />
                    );
                  } else if (
                    index === Math.floor(updatedData.rating || 0) &&
                    (updatedData.rating || 0) % 1 !== 0
                  ) {
                    return (
                      <StarOutlined
                        key={index}
                        style={{ fontSize: '24px', color: '#FFD700' }}
                      />
                    );
                  } else {
                    return (
                      <StarOutlined
                        key={index}
                        style={{ fontSize: '24px', color: '#FFD700' }}
                      />
                    );
                  }
                })}
              </div>
            </div>
          </Form.Item>
        </div>
        {/* </div> */}
        <div className="flex justify-end">
          <Button
            className="bg-orange-600 text-white"
            size="large"
            title="Cancel"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-white ml-2"
            size="large"
            onClick={handleSubmit}
            title="Update"
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateBHModal;
