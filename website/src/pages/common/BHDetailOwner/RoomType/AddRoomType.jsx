import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/component';
import {
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  Modal,
  ConfigProvider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  addRoomTypeToBoardingHouse,
  getAllFacilities,
} from '@/api/roomTypeAPI';
import { useTheme } from '@/context/themeContext';
import classNames from 'classnames';
import Style from './AddRoomTypeModal.module.css';

const cx = classNames.bind(Style);

const AddRoomTypeModal = ({ onAddData, boardingHouseId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    typeName: '',
    facilities: [],
    roomSize: '',
    price: '',
    peopleNumber: '',
    image: null,
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getAllFacilities();
        setFacilities(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        toast.error('Failed to fetch facilities.');
        setFacilities([]);
      }
    };
    fetchFacilities();
  }, []);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setFormData({
      typeName: '',
      facilities: [],
      roomSize: '',
      price: '',
      peopleNumber: '',
      image: null,
    });
    setIsModalVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      facilities: selectedValues.length > 0 ? selectedValues : [],
    }));
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFormData((prev) => ({ ...prev, image: file }));
      return false;
    },
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.typeName.trim()) {
        toast.error('Type Name is required.');
        return;
      }
      if (!/^\d+x\d+$/.test(formData.roomSize)) {
        toast.error('Room size must be in format 20x30 or 30x40.');
        return;
      }
      if (!formData.price || formData.price < 0) {
        toast.error('Please enter rent/month valid!');
        return;
      }
      if (!formData.peopleNumber || formData.peopleNumber < 1) {
        toast.error('People number must be at least 1.');
        return;
      }
      if (!formData.image) {
        toast.error('You must upload an image.');
        return;
      }

      const payload = new FormData();
      payload.append('typeName', formData.typeName);
      payload.append('roomSize', formData.roomSize);
      payload.append('price', formData.price);
      payload.append('peopleNumber', formData.peopleNumber);
      payload.append('roomType', formData.image);
      payload.append('facilities', JSON.stringify(formData.facilities));

      const response = await addRoomTypeToBoardingHouse(
        boardingHouseId,
        payload
      );

      if (response?.message === 'Room Type added successfully') {
        toast.success('Room type added successfully!');
        onAddData();
        closeModal();
      } else {
        throw new Error(response?.message || 'Failed to add room type.');
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  const themeConfig = {
    algorithm: darkMode
      ? ConfigProvider.darkAlgorithm
      : ConfigProvider.defaultAlgorithm,
    token: darkMode
      ? {
          colorText: '#ffffff',
          colorBgContainer: '#1f2937',
          colorBorder: '#4b5563',
          colorTextPlaceholder: '#9ca3af',
        }
      : {},
    components: {
      Input: darkMode
        ? {
            colorBgContainer: '#374151',
            colorText: '#f9fafb',
            colorBorder: '#4b5563',
          }
        : {},
      Select: darkMode
        ? {
            colorBgElevated: '#374151',
            colorText: '#f9fafb',
            optionSelectedBg: '#2563eb',
          }
        : {},
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <>
        <Button btnAdd title="Add Room Type" size="large" onClick={openModal} />

        <Modal
          title={
            <span className={darkMode ? 'text-white' : ''}>
              Create Room Type
            </span>
          }
          open={isModalVisible}
          onCancel={closeModal}
          footer={null}
          destroyOnClose
          className={darkMode ? 'ant-modal-dark' : ''}
          styles={
            darkMode
              ? {
                  mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
                  content: {
                    backgroundColor: '#1f2937',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  },
                  header: {
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                  },
                  body: {
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                  },
                }
              : {}
          }
        >
          <Form layout="vertical" onSubmitCapture={handleSubmit}>
            <Form.Item label="Room Type Name" required>
              <Input
                placeholder="Enter room type name"
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                className={cx({ 'dark-mode-input': darkMode })}
              />
            </Form.Item>

            <Form.Item label="Facilities">
              <Select
                mode="multiple"
                placeholder="Select facilities"
                value={formData.facilities}
                onChange={handleSelectChange}
                className={cx({ 'dark-mode-select': darkMode })}
              >
                {facilities.map((facility) => (
                  <Select.Option key={facility._id} value={facility._id}>
                    {facility.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Room Size (e.g., 20x30)" required>
              <Input
                placeholder="Enter room size"
                name="roomSize"
                value={formData.roomSize}
                onChange={handleInputChange}
                className={cx({ 'dark-mode-input': darkMode })}
              />
            </Form.Item>

            <Form.Item label="Rent/month" required>
              <InputNumber
                placeholder="Enter rent/month"
                name="price"
                value={formData.price}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, price: value }))
                }
                className="w-full"
              />
            </Form.Item>

            <Form.Item label="People Number" required>
              <InputNumber
                placeholder="Enter number of people"
                name="peopleNumber"
                value={formData.peopleNumber}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, peopleNumber: value }))
                }
                className="w-full"
              />
            </Form.Item>

            <Form.Item label="Room Image" required>
              {!formData.image ? (
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <PlusOutlined />
                    <p>Upload</p>
                  </div>
                </Upload>
              ) : (
                <div className="relative" style={{ width: 200, height: 200 }}>
                  <Image
                    src={URL.createObjectURL(formData.image)}
                    alt="Room"
                    style={{ width: 200, height: 200 }}
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    X
                  </button>
                </div>
              )}
            </Form.Item>

            <div className="flex justify-end mt-4">
              <Button
                btnCancel
                title="Cancel"
                onClick={closeModal}
                className="mr-2"
              />
              <Button
                className="bg-primary text-white"
                title="Submit"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </Form>
        </Modal>
      </>
    </ConfigProvider>
  );
};

export default AddRoomTypeModal;
