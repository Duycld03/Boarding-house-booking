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
  const [updatedData, setUpdatedData] = useState({}); // Updated form data
  const [loading, setLoading] = useState(false); // Loading state
  const [provinces, setProvinces] = useState([]); // Provinces list
  const [districts, setDistricts] = useState([]); // Districts list
  const [wards, setWards] = useState([]); // Wards list
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]); // House types
  const [images, setImages] = useState([]);

  // Initialize form data and images when `formData` changes
  useEffect(() => {
    console.log('Received formData:', formData);

    if (formData) {
      let primaryImage = {};
      const otherImage = [];
      formData.images.forEach((image) => {
        if (image.isPrimary) {
          primaryImage = image;
        } else {
          otherImage.push(image);
        }
      });
      console.log('Other', otherImage);

      setUpdatedData({
        ...formData,
        primaryImage: primaryImage, // Đảm bảo không undefined
        otherImages: otherImage,
      });

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
    const keys = name.split('.'); // Split by dot notation for nested fields (e.g., "address.detail")

    if (keys.length === 2) {
      // Handle nested fields (e.g., "address.detail")
      setUpdatedData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      // Handle top-level fields
      setUpdatedData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e, isPrimary = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isPrimary) {
      // Set the primary image without overriding other images
      setUpdatedData((prev) => ({
        ...prev,
        primaryImage: file, // Update primaryImage only
      }));
    } else {
      setUpdatedData((prev) => ({
        ...prev,
        otherImages: [...(prev.otherImages || []), file], // Append to otherImages
      }));
    }
  };
  const handleRemovePrimaryImage = () => {
    // Remove the primary image from `updatedData` and `images`
    setUpdatedData((prev) => ({
      ...prev,
      primaryImage: null, // Set primaryImage to null
    }));

    // Remove the primary image from the `images` array
    setImages((prevImages) => prevImages.filter((img) => !img.isPrimary));

    toast.success('Primary image removed.');
  };
  // Remove other images
  const handleRemoveOtherImage = (index) => {
    setUpdatedData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
    toast.success('Temporary image removed.');
  };

  // Delete images from backend
  const handleImageDelete = (id) => {
    setImages((prev) => prev.filter((img) => img._id !== id));
    toast.success('Image removed from the list.');
  };
  const handleSelectedTypesChange = (event) => {
    const { name, value } = event.target;
    setUpdatedData((prevData) => ({
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

  const handleSubmit = async () => {
    if (!updatedData) return;

    try {
      setLoading(true);
      console.log('✅ Updated Data:', updatedData);

      const payload = new FormData();

      // Append basic form fields
      payload.append(
        'boardingHouseType',
        updatedData.boardingHouseType?._id || updatedData.boardingHouseType
      );
      payload.append('name', updatedData.name);
      payload.append('description', updatedData.description);
      payload.append('priceRange', updatedData.priceRange);
      payload.append('electricityPrice', updatedData.electricityPrice);
      payload.append('waterPrice', updatedData.waterPrice);
      payload.append('address[province]', updatedData.address.province);
      payload.append('address[district]', updatedData.address.district);
      payload.append('address[ward]', updatedData.address.ward);
      payload.append('address[detail]', updatedData.address.detail);

      // Append primary image (new or existing)
      const oldImg = [];

      if (updatedData.primaryImage) {
        if (updatedData.primaryImage instanceof File) {
          payload.append('boardingHouse', updatedData.primaryImage);
        } else {
          oldImg.push(updatedData.primaryImage);
        }
      } else {
        toast.error('A primary image is required.');
        return;
      }

      // Append new "Other Images" (files)
      if (updatedData.otherImages) {
        console.log(updatedData.otherImages);

        updatedData.otherImages.forEach((file) => {
          if (file instanceof File) {
            payload.append('boardingHouse', file);
          } else {
            oldImg.push(file);
          }
        });
      }
      if (oldImg.length > 0) {
        payload.append('boardingHouse', JSON.stringify(oldImg));
      }
      // for (let pair of payload.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      // Make API request
      const response = await updateBoardingHouseDetailsOwner(
        updatedData._id, // Boarding house ID
        payload
      );

      if (response?.success) {
        toast.success(
          response.message || 'Boarding house updated successfully.'
        );
        onUpdate(); // Notify parent to refresh data
        onCancel(); // Close modal
      } else {
        toast.error(response?.message || 'Failed to update boarding house.');
      }
    } catch (error) {
      console.error('❌ Error updating boarding house:', error);
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
        // onFinish={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg"
      >
        <h2 className="text-3xl font-bold mb-4">1. Information</h2>

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
        <Form.Item className="mb-4">
          {/* Province */}
          <Form.Item
            label="Province"
            required
            rules={[{ required: true, message: 'Province is required' }]}
          >
            <Select
              placeholder="Select Province"
              loading={!provinces.length} // Loader when provinces are being fetched
              value={updatedData?.address?.province || null}
              onChange={(value) => {
                handleInputChange({
                  target: {
                    name: 'address.province',
                    value,
                  },
                });
                // Clear district and ward when province changes
                setUpdatedData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    province: value,
                    district: null,
                    ward: null,
                  },
                }));
              }}
              allowClear
            >
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.name}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* District */}
          <Form.Item
            label="District"
            required
            rules={[{ required: true, message: 'District is required' }]}
          >
            <Select
              placeholder="Select District"
              loading={!districts.length && updatedData?.address?.province} // Loader when districts are being fetched
              value={updatedData?.address?.district || null}
              onChange={(value) => {
                handleInputChange({
                  target: {
                    name: 'address.district',
                    value,
                  },
                });
                // Clear ward when district changes
                setUpdatedData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    district: value,
                    ward: null,
                  },
                }));
              }}
              disabled={!updatedData?.address?.province} // Disabled until province is selected
              allowClear
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.name}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Ward */}
          <Form.Item
            label="Ward"
            required
            rules={[{ required: true, message: 'Ward is required' }]}
          >
            <Select
              placeholder="Select Ward"
              loading={!wards.length && updatedData?.address?.district} // Loader when wards are being fetched
              value={updatedData?.address?.ward || null}
              onChange={(value) => {
                handleInputChange({
                  target: {
                    name: 'address.ward',
                    value,
                  },
                });
                setUpdatedData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    ward: value,
                  },
                }));
              }}
              disabled={!updatedData?.address?.district} // Disabled until district is selected
              allowClear
            >
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.name}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Detail">
            <Input.TextArea
              name="address.detail" // Correctly set name to "address.detail"
              value={updatedData?.address?.detail || ''} // Bind to the state
              onChange={handleInputChange} // Use the updated handleInputChange function
              rows={4}
            />
          </Form.Item>
        </Form.Item>
        <h2 className="text-3xl font-bold mb-4 mt-10 ">3. Image</h2>
        <Form.Item label="Primary Image" className="mb-4">
          <div className="flex flex-col gap-4">
            {/* Check if a primary image exists */}
            {updatedData.primaryImage ||
            images?.find((img) => img.isPrimary) ? (
              <div className="relative">
                <Image
                  src={
                    updatedData?.primaryImage?.imageUrl ||
                    URL.createObjectURL(updatedData.primaryImage)
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
            {/* Display Other Images */}
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
                  src={file?.imageUrl || URL.createObjectURL(file)}
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
              name="boardingHouse"
              className="custom-upload"
            >
              <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                <PlusOutlined className="text-2xl text-gray-400" />
                <p className="text-gray-500 mt-2 text-sm font-medium">
                  Add Other Image
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
