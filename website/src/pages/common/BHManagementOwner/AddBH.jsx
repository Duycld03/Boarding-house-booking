import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AddressSelector from '../../../component/AddressSelector';
import { getAllBoardingHouseTypesOwner } from '../../../api/BoardingHouseAPI';
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
  ConfigProvider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createBoardingHouseOwner,
  getManagersForOwner,
} from '../../../api/BoardingHouseAPI'; // Assuming this function exists to fetch managers
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import classNames from 'classnames';
import './AddBHModal.module.css'; // Import custom CSS for additional dark mode fixes
import './darkModeOverrides.css';

const cx = classNames;

const AddBHModal = ({ onAddData }) => {
  const { t } = useTranslation('bhManagement');
  const { darkMode } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    boardingHouseType: '',
    name: '',
    address: { province: '', district: '', ward: '', detail: '' },
    description: '',
    primaryImage: null,
    otherImages: [],
    priceRange: '',
    electricityPrice: '',
    waterPrice: '',
    staffId: '',
  });
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
  const [geoLocation, setGeoLocation] = useState(null);
  const [managers, setManagers] = useState([]); // To store the list of managers

  const darkInputStyle = darkMode
    ? {
      backgroundColor: '#374151',
      color: '#fff',
      borderColor: '#4b5563',
    }
    : {};
  const darkModeSelectClass = cx({
    'dark-mode-select': darkMode,
  });

  // Fetch provinces/districts/wards on address change
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
        console.error('Error fetching address data:', error);
      }
    };
    fetchData();
  }, [formData?.address?.province, formData?.address?.district]);

  // Fetch boarding house types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getAllBoardingHouseTypesOwner();
        setBoardingHouseTypes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch boarding house types:', error);
        toast.error(t('errors.fetchBoardingHouseTypes'));
      }
    };
    fetchTypes();
  }, [t]);
  // Fetch managers for the logged-in owner
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await getManagersForOwner(); // Assuming this API returns managers for the logged-in owner
        setManagers(response.data || []);
      } catch (error) {
        // console.error('Failed to fetch managers:', error);
        // toast.error(t('errors.fetchManagers'));
      }
    };
    fetchManagers();
  }, [t]);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      boardingHouseType: '',
      name: '',
      address: { province: '', district: '', ward: '', detail: '' },
      description: '',
      primaryImage: null,
      otherImages: [],
      priceRange: '',
      electricityPrice: '',
      waterPrice: '',
      staffId: '',
    });
    setDistricts([]);
    setWards([]);
    setGeoLocation(null);
  };

  // Handlers
  const openModal = () => {
    resetFormData();
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

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
    setFormData((prev) => ({ ...prev, primaryImage: null }));
  };

  // Fetch geolocation from address
  const getLocation = async () => {
    try {
      if (
        !formData.address.ward ||
        !formData.address.district ||
        !formData.address.province
      )
        return;

      const res = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            format: 'json',
            q: `${formData.address.ward}, ${formData.address.district}, ${formData.address.province}`,
            polygon_geojson: 1,
          },
        }
      );
      if (res.data && res.data.length > 0) {
        setGeoLocation(res.data[0]);
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  useEffect(() => {
    getLocation();
  }, [
    formData?.address?.ward,
    formData?.address?.district,
    formData?.address?.province,
  ]);

  // Submit handler
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation with i18n messages
      if (!formData.boardingHouseType) {
        toast.error(t('errors.selectBoardingHouseType'));
        setLoading(false);
        return;
      }

      if (!formData.name) {
        toast.error(t('errors.enterBoardingHouseName'));
        setLoading(false);
        return;
      }
      if (!formData.address.province) {
        toast.error(t('errors.selectProvince'));
        setLoading(false);
        return;
      }
      if (!formData.address.district) {
        toast.error(t('errors.selectDistrict'));
        setLoading(false);
        return;
      }
      if (!formData.address.ward) {
        toast.error(t('errors.selectWard'));
        setLoading(false);
        return;
      }
      if (!formData.address.detail) {
        toast.error(t('errors.enterAddressDetail'));
        setLoading(false);
        return;
      }
      if (!formData.primaryImage) {
        toast.error(t('errors.uploadPrimaryImage'));
        setLoading(false);
        return;
      }
      if (!formData.priceRange) {
        toast.error(t('errors.enterPriceRange'));
        setLoading(false);
        return;
      }
      if (!formData.electricityPrice) {
        toast.error(t('errors.enterElectricityPrice'));
        setLoading(false);
        return;
      }
      if (!formData.waterPrice) {
        toast.error(t('errors.enterWaterPrice'));
        setLoading(false);
        return;
      }
      if (!geoLocation) {
        toast.error(t('errors.markLocationOnMap'));
        setLoading(false);
        return;
      }
      if (formData.otherImages.length > 15) {
        toast.error(t('errors.maxOtherImages'));
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = new FormData();
      payload.append('boardingHouseType', formData.boardingHouseType);
      payload.append('name', formData.name);
      payload.append('staffId', formData.staffId);

      payload.append('description', formData.description);
      payload.append('priceRange', formData.priceRange);
      payload.append('electricityPrice', formData.electricityPrice);
      payload.append('waterPrice', formData.waterPrice);
      payload.append('address[province]', formData.address.province);
      payload.append('address[district]', formData.address.district);
      payload.append('address[ward]', formData.address.ward);
      payload.append('address[detail]', formData.address.detail);
      payload.append('location[lat]', geoLocation.lat);
      payload.append('location[lon]', geoLocation.lon);

      const allImages = [];
      if (formData.primaryImage) allImages.push(formData.primaryImage);
      allImages.push(...formData.otherImages);

      if (allImages.length === 0) {
        toast.error(t('errors.uploadAtLeastOneImage'));
        setLoading(false);
        return;
      }

      allImages.forEach((file) => {
        payload.append('boardingHouse', file);
      });

      const response = await createBoardingHouseOwner(payload);
      console.log('Add', response);

      if (response?.message === 'Boarding house created successfully!') {
        toast.success(t('messages.createdSuccess'));
        onAddData();
        closeModal();
      } else {
        throw new Error(response?.message || t('errors.failedToAdd'));
      }
    } catch (error) {
      console.error('Error submitting boarding house:', error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        t('errors.failedToSubmitForm')
      );
    } finally {
      setLoading(false);
      setGeoLocation(null);
    }
  };

  // Dark mode modal styles
  const modalStyles = darkMode
    ? {
      mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
      content: {
        backgroundColor: '#1f2937',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
      header: {
        backgroundColor: '#1f2937',
        color: '#fff',
        borderBottom: '1px solid #374151',
      },
      body: { backgroundColor: '#1f2937', color: '#fff' },
      footer: { backgroundColor: '#1f2937', borderTop: '1px solid #374151' },
    }
    : {};

  // Form item style
  const formItemStyle = darkMode
    ? { marginBottom: 4, color: '#F9FAFB' }
    : { marginBottom: 4 };

  // Button styles
  const primaryBtnClass = cx('bg-primary w-full text-white', {
    'dark:bg-blue-600': darkMode,
  });
  const secondaryBtnClass = cx('bg-gray-300', { 'dark:bg-gray-600': darkMode });

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode
          ? ConfigProvider.darkAlgorithm
          : ConfigProvider.defaultAlgorithm,
        token: darkMode
          ? {
            colorBgContainer: '#1f2937',
            colorText: '#F9FAFB',
            colorBorder: '#4B5563',
            colorPrimary: '#3b82f6',
          }
          : {},
      }}
    >
      <>
        <Button
          btnAdd
          title={t('buttons.addBoardingHouse')}
          size="large"
          onClick={openModal}
        />

        <Modal
          title={
            <span className={cx({ 'text-white font-medium': darkMode })}>
              {t('modals.createBoardingHouseTitle')}
            </span>
          }
          open={isModalVisible}
          onCancel={closeModal}
          footer={null}
          destroyOnClose
          styles={modalStyles}
          className={darkMode ? 'ant-modal-dark' : ''}
        >
          <Form
            layout="vertical"
            onSubmitCapture={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className={cx(
              { 'bg-gray-800': darkMode, 'bg-white': !darkMode },
              'rounded-lg',
              'w-full max-w-3xl'
            )}
          >
            <h2
              className={cx('text-3xl font-bold mb-4', {
                'text-white': darkMode,
              })}
            >
              {t('form.section.information')}
            </h2>

            <Form.Item
              label={t('form.labels.boardingHouseType')}
              name="boardingHouseType"
              rules={[
                {
                  required: true,
                  message: t('form.validation.selectBoardingHouseType'),
                },
              ]}
              style={formItemStyle}
            >
              <Select
                placeholder={t('form.placeholders.selectType')}
                className={darkModeSelectClass}
                style={darkInputStyle.select}
                value={formData.boardingHouseType}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    boardingHouseType: value,
                  }))
                }
                dropdownStyle={darkMode ? { backgroundColor: '#374151' } : {}}
              >
                {boardingHouseTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {t(`boardingHouseTypes.${type.label}`) || type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={t('form.labels.manager')}
              name="staffId"
              style={formItemStyle}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                placeholder={t('form.placeholders.selectManager')}
                value={formData.staffId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, staffId: value }))
                }
                className={darkModeSelectClass}
                style={darkInputStyle.select}
                dropdownStyle={darkMode ? { backgroundColor: '#374151' } : {}}
              >
                {managers.map((manager) => (
                  <Select.Option key={manager._id} value={manager._id}>
                    {manager.fullname}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={t('form.labels.boardingHouseName')}
              name="name"
              rules={[
                {
                  required: true,
                  message: t('form.validation.enterBoardingHouseName'),
                },
              ]}
              style={formItemStyle}
            >
              <Input
                placeholder={t('form.placeholders.enterBoardingHouseName')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={cx({ 'dark-mode-input': darkMode })}
                style={
                  darkMode
                    ? {
                      // backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#F9FAFB',
                    }
                    : {}
                }
              />
            </Form.Item>

            <Form.Item
              label={t('form.labels.description')}
              name="description"
              style={formItemStyle}
            >
              <Input.TextArea
                placeholder={t('form.placeholders.enterDescription')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={cx({ 'dark-mode-input': darkMode })}
                style={
                  darkMode
                    ? {
                      // backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#F9FAFB',
                    }
                    : {}
                }
              />
            </Form.Item>

            <h2
              className={cx('text-3xl font-bold mb-4 mt-10', {
                'text-white': darkMode,
              })}
            >
              {t('form.section.address')}
            </h2>

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
              darkMode={darkMode} // nếu AddressSelector hỗ trợ dark mode
            />

            <h2
              className={cx('text-3xl font-bold mb-4 mt-10', {
                'text-white': darkMode,
              })}
            >
              {t('form.section.images')}
            </h2>

            <Form.Item label={t('form.labels.primaryImage')} className="mb-4">
              <div className="flex flex-col gap-4">
                {!formData.primaryImage && (
                  <Upload
                    {...uploadProps}
                    name="boardingHouse"
                    listType="picture-card"
                    showUploadList={false}
                    className="custom-upload w-full max-w-lg"
                  >
                    <div
                      className={cx(
                        'flex flex-col items-center justify-center border border-dashed rounded-lg p-6 transition',
                        {
                          'border-gray-300 hover:border-blue-500 hover:bg-gray-50 text-gray-500':
                            !darkMode,
                          'border-gray-600 hover:border-blue-600 hover:bg-gray-700 text-white':
                            darkMode,
                        }
                      )}
                    >
                      <PlusOutlined className="text-2xl" />
                      <p className="mt-2 text-sm font-medium">
                        {t('form.labels.addImage')}
                      </p>
                      <p className="text-xs">
                        {t('form.labels.dragDropOrClick')}
                      </p>
                    </div>
                  </Upload>
                )}

                {formData.primaryImage && (
                  <div className="items-center justify-center flex flex-col gap-4 relative">
                    <Image
                      src={URL.createObjectURL(formData.primaryImage)}
                      alt="Primary"
                      className="object-cover border rounded"
                      style={{ width: '100%', height: 'auto', maxHeight: 300 }}
                      preview={{
                        mask: <span className="text-white">Preview</span>,
                      }}
                    />
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
              <style>{`
                .custom-upload .ant-upload {
                  border: none !important;
                  background: none !important;
                  padding: 0 !important;
                }
              `}</style>
            </Form.Item>

            <Form.Item label={t('form.labels.otherImages')} className="">
              <div className="flex flex-wrap gap-4">
                {formData.otherImages.map((file, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Other ${index + 1}`}
                      name="boardingHouse"
                      className="object-cover border rounded"
                      width={100}
                      height={100}
                      preview={{ mask: <span>Preview</span> }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                    >
                      X
                    </button>
                  </div>
                ))}

                <Upload
                  {...uploadOtherImgProps}
                  listType="picture-card"
                  showUploadList={false}
                  className="custom-upload"
                >
                  <div
                    className={cx(
                      'flex flex-col items-center justify-center border border-dashed rounded-lg p-6 transition',
                      {
                        'border-gray-300 hover:border-blue-500 hover:bg-gray-50 text-gray-500':
                          !darkMode,
                        'border-gray-600 hover:border-blue-600 hover:bg-gray-700 text-white':
                          darkMode,
                      }
                    )}
                  >
                    <PlusOutlined className="text-2xl" />
                    <p className="mt-2 text-sm font-medium">
                      {t('form.labels.addOtherImages')}
                    </p>
                    <p className="text-xs">
                      {t('form.labels.dragDropOrClick')}
                    </p>
                  </div>
                </Upload>
              </div>
              <style>{`
                .custom-upload .ant-upload {
                  border: none !important;
                  background: none !important;
                  padding: 0 !important;
                }
              `}</style>
            </Form.Item>

            <h2
              className={cx('text-3xl font-bold mb-4', {
                'text-white': darkMode,
              })}
            >
              {t('form.section.price')}
            </h2>

            <Form.Item
              label={t('form.labels.priceRange')}
              name="priceRange"
              rules={[
                {
                  required: true,
                  message: t('form.validation.enterPriceRange'),
                },
              ]}
              style={formItemStyle}
            >
              <InputNumber
                placeholder={t('form.placeholders.enterPriceRange')}
                name="priceRange"
                value={formData.priceRange}
                onChange={(value) =>
                  handleInputChange({ target: { name: 'priceRange', value } })
                }
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                className={cx('w-full', { 'dark-mode-input': darkMode })}
                style={
                  darkMode
                    ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#F9FAFB',
                    }
                    : {}
                }
                min={0}
              />
            </Form.Item>

            <Form.Item
              label={t('form.labels.electricityPrice')}
              name="electricityPrice"
              rules={[
                {
                  required: true,
                  message: t('form.validation.enterElectricityPrice'),
                },
              ]}
              style={formItemStyle}
            >
              <InputNumber
                placeholder={t('form.placeholders.enterElectricityPrice')}
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
                className={cx('w-full', { 'dark-mode-input': darkMode })}
                style={
                  darkMode
                    ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#F9FAFB',
                    }
                    : {}
                }
                min={0}
              />
            </Form.Item>

            <Form.Item
              label={t('form.labels.waterPrice')}
              name="waterPrice"
              rules={[
                {
                  required: true,
                  message: t('form.validation.enterWaterPrice'),
                },
              ]}
              style={formItemStyle}
            >
              <InputNumber
                placeholder={t('form.placeholders.enterWaterPrice')}
                name="waterPrice"
                value={formData.waterPrice}
                onChange={(value) =>
                  handleInputChange({ target: { name: 'waterPrice', value } })
                }
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                className={cx('w-full', { 'dark-mode-input': darkMode })}
                style={
                  darkMode
                    ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#F9FAFB',
                    }
                    : {}
                }
                min={0}
              />
            </Form.Item>

            <div className="flex justify-end mt-4">
              <Button
                title={t('buttons.cancel')}
                btnCancel={true}
                onClick={closeModal}
                className={cx('bg-red-500 hover:bg-red-600 text-white mr-2', {
                  'dark:bg-red-700': darkMode,
                })}
                size="large"
              >
                {t('buttons.cancel')}
              </Button>
              <Button
                className={cx('bg-primary text-white flex items-center', {
                  'dark:bg-blue-600': darkMode,
                })}
                size="large"
                onClick={handleSubmit}
                title={loading ? t('buttons.loading') : t('buttons.submit')}
                loading={loading}
              >
                {loading ? <Spin size="small" className="mr-2" /> : null}
                {t('buttons.submit')}
              </Button>
            </div>
          </Form>
        </Modal>
      </>
    </ConfigProvider>
  );
};

export default AddBHModal;
