import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  ConfigProvider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/component';
import { toast } from 'react-toastify';
import {
  getAllFacilities,
  updateRoomTypeToBoardingHouse,
} from '@/api/roomTypeAPI';
import { useTheme } from '@/context/themeContext';
import classNames from 'classnames';
import Style from './UpdateRoomTypeModal.module.css';
import { useTranslation } from 'react-i18next';

const cx = classNames.bind(Style);

const UpdateRoomTypeModal = ({ visible, onClose, roomData, onUpdate }) => {
  const { darkMode } = useTheme();
  const { t } = useTranslation('roomType');

  const [formData, setFormData] = useState({
    typeName: '',
    facilities: [],
    roomSize: '',
    price: '',
    peopleNumber: '',
    image: null,
  });

  const [facilitiesList, setFacilitiesList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getAllFacilities();
        setFacilitiesList(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        toast.error(t('toast.fetchFacilitiesError'));
      }
    };
    fetchFacilities();
  }, [t]);

  useEffect(() => {
    if (!roomData) return;
    setFormData({
      typeName: roomData.typeName || '',
      facilities: roomData.facilities?.map((fac) => fac._id) || [],
      roomSize: roomData.roomSize || '',
      price: roomData.price || '',
      peopleNumber: roomData.peopleNumber || '',
      image: roomData.image?.imageUrl || null,
    });
    setImagePreview(roomData.image?.imageUrl || null);
  }, [roomData]);

  useEffect(() => {
    if (!visible) {
      setFormData({
        typeName: '',
        facilities: [],
        roomSize: '',
        price: '',
        peopleNumber: '',
        image: null,
      });
      setImagePreview(null);
    }
  }, [visible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      facilities: selectedValues.length ? [...selectedValues] : [],
    }));
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      return false;
    },
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.typeName.trim()) {
      toast.error(t('form.typeName.error'));
      return;
    }
    if (!/\d+x\d+/.test(formData.roomSize)) {
      toast.error(t('form.roomSize.error'));
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error(t('form.price.error'));
      return;
    }
    if (!formData.peopleNumber || formData.peopleNumber < 1) {
      toast.error(t('form.peopleNumber.error'));
      return;
    }
    if (!formData.image) {
      toast.error(t('form.image.error'));
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('typeName', formData.typeName);
    formDataToSend.append('roomSize', formData.roomSize);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('peopleNumber', formData.peopleNumber);
    formDataToSend.append(
      'facilities',
      JSON.stringify(formData.facilities || [])
    );

    if (formData.image instanceof File) {
      formDataToSend.append('roomType', formData.image);
    }

    try {
      const response = await updateRoomTypeToBoardingHouse(
        roomData._id,
        formDataToSend
      );
      if (response?.message === 'Room Type updated successfully') {
        toast.success(t('toast.updateSuccess'));
        onClose();
        onUpdate();
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || t('toast.error'));
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
      <Modal
        title={
          <span className={darkMode ? 'text-white' : ''}>
            {t('modal.updateTitle')}
          </span>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        className={darkMode ? 'ant-modal-dark' : ''}
        styles={
          darkMode
            ? {
                mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
                content: {
                  backgroundColor: '#1f2937',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                },
                header: { backgroundColor: '#1f2937', color: '#ffffff' },
                body: { backgroundColor: '#1f2937', color: '#ffffff' },
              }
            : {}
        }
      >
        <Form layout="vertical" className={cx('no-margin')}>
          <Form.Item label={t('form.typeName.label')} required>
            <Input
              name="typeName"
              value={formData.typeName}
              onChange={handleInputChange}
              placeholder={t('form.typeName.placeholder')}
              className={cx({ 'dark-mode-input': darkMode })}
            />
          </Form.Item>

          <Form.Item label={t('form.facilities.label')}>
            <Select
              mode="multiple"
              placeholder={t('form.facilities.placeholder')}
              value={formData.facilities}
              onChange={handleSelectChange}
              className={cx({ 'dark-mode-select': darkMode })}
            >
              {facilitiesList.map((facility) => (
                <Select.Option key={facility._id} value={facility._id}>
                  {t(`facilityNames.${facility.name}`)}{' '}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t('form.roomSize.label')} required>
            <Input
              name="roomSize"
              value={formData.roomSize}
              onChange={handleInputChange}
              placeholder={t('form.roomSize.placeholder')}
              className={cx({ 'dark-mode-input': darkMode })}
            />
          </Form.Item>

          <Form.Item label={t('form.price.label')} required>
            <InputNumber
              name="price"
              value={formData.price ? Number(formData.price) : undefined}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, price: value }))
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|,*/g, '')}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label={t('form.peopleNumber.label')} required>
            <InputNumber
              name="peopleNumber"
              value={formData.peopleNumber}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, peopleNumber: value }))
              }
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Room Image">
            {!imagePreview ? (
              <Upload {...uploadProps} listType="picture-card">
                <div>
                  <PlusOutlined />
                  <p>Upload</p>
                </div>
              </Upload>
            ) : (
              <div className="relative" style={{ width: 200, height: 200 }}>
                <Image
                  src={imagePreview}
                  alt="Room Image"
                  className="w-full rounded"
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
              title={t('button.cancel')}
              onClick={onClose}
              className="mr-2"
            />
            <Button
              className="bg-primary text-white"
              title={t('button.update')}
              loading={loading}
              onClick={handleSubmit}
            />
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default UpdateRoomTypeModal;
