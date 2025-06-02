import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Image,
  Button,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  HeartFilled,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { getAllBoardingHouseTypesOwner } from '../../../api/BoardingHManagement';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from '../../../api/apiAddress';
import { getBoardingHouseDetail } from '../../../api/ownerUser/boardingHouse';
import { updateBoardingHouseDetailsOwner } from '../../../api/BoardingHManagement';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationPicker from '@/component/LocationPicker';
import RoomType from './RoomType/RoomType';
import DepositManagement from '@/pages/common/BHDetailOwner/DepositManagement';
import RenewalRequest from './RenewalRequestManagement/RenewalRequest';
import TenantManagement from './TenantManagement/TenantManagement';
import RoomManagement from './RoomManagement/RoomManagement';
import RevenueManagement from './RevenueManagement';
import RentPaymentManagement from './RentPaymentManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';
import './BHDetailOwner.module.css'; // Import custom CSS for additional dark mode fixes
import classNames from 'classnames';
import './darkModeOverrides.css';

const { TabPane } = Tabs;

const cx = classNames;

const BHDetailOwner = () => {
  const { boardingHouseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation('bhManagement');
  const { darkMode } = useTheme();

  const boardingHouseName = location.state?.name || t('defaultTitle');

  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
  const [geoLocation, setGeoLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const fetchBoardingHouseDetails = async () => {
    if (!boardingHouseId) {
      toast.error(t('errors.noId'));
      navigate('/bh-management-owner');
      return;
    }
    try {
      const response = await getBoardingHouseDetail(boardingHouseId);
      const primaryImage = response.images.find((img) => img.isPrimary);
      const otherImages = response.images.filter((img) => !img.isPrimary);
      setUpdatedData({ ...response, primaryImage, otherImages });
      setCurrentLocation([response?.location?.lat, response?.location?.lon]);
    } catch (error) {
      console.error('Failed to fetch boarding house data:', error);
      toast.error(t('errors.fetchFailed'));
    }
  };

  useEffect(() => {
    fetchBoardingHouseDetails();
  }, []);

  useEffect(() => {
    if (updatedData?.location) return;
    if (geoLocation) {
      setCurrentLocation([geoLocation.lat, geoLocation.lon]);
    }
  }, [geoLocation]);
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      console.log('Added dark-mode class to body');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

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
        toast.error(t('errors.fetchAddressFailed'));
      }
    };

    if (updatedData?.address?.province) {
      fetchAddressData();
    }
  }, [updatedData?.address?.province, updatedData?.address?.district, t]);

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

  const handleFileChange = (e, isPrimary = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isPrimary) {
      setUpdatedData((prev) => ({
        ...prev,
        primaryImage: file,
      }));
      return;
    }

    if ((updatedData.otherImages?.length || 0) >= 15) {
      toast.error(t('errors.maxOtherImages'));
      return;
    }

    setUpdatedData((prev) => ({
      ...prev,
      otherImages: [...(prev.otherImages || []), file],
    }));
  };
  const handleRemovePrimaryImage = () => {
    setUpdatedData((prev) => ({
      ...prev,
      primaryImage: null,
    }));
  };
  const handleRemoveOtherImage = (index) => {
    setUpdatedData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
    toast.success(t('messages.imageRemoved'));
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

  const getLocation = async () => {
    try {
      const res = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            format: 'json',
            q: `${updatedData.address.ward}, ${updatedData.address.district}, ${updatedData.address.province}`,
            polygon_geojson: 1,
          },
        }
      );
      setGeoLocation(res.data[0]);
      console.log('GeoLocation result:', res.data[0]);
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  useEffect(() => {
    getLocation();
  }, [updatedData?.address?.ward]);

  const handleSubmit = async () => {
    if (!updatedData) return;

    try {
      setLoading(true);

      if (!updatedData.boardingHouseType) {
        toast.error(t('validation.selectBoardingHouseType'));
        setLoading(false);
        return;
      }
      if (!updatedData.name) {
        toast.error(t('validation.enterName'));
        setLoading(false);
        return;
      }
      if (!updatedData.address.province) {
        toast.error(t('validation.selectProvince'));
        setLoading(false);
        return;
      }
      if (!updatedData.address.district) {
        toast.error(t('validation.selectDistrict'));
        setLoading(false);
        return;
      }
      if (!updatedData.address.ward) {
        toast.error(t('validation.selectWard'));
        setLoading(false);
        return;
      }
      if (!updatedData.address.detail) {
        toast.error(t('validation.enterDetailAddress'));
        setLoading(false);
        return;
      }
      if (!updatedData.priceRange) {
        toast.error(t('validation.enterPriceRange'));
        setLoading(false);
        return;
      }
      if (!updatedData.electricityPrice) {
        toast.error(t('validation.enterElectricityPrice'));
        setLoading(false);
        return;
      }
      if (!updatedData.waterPrice) {
        toast.error(t('validation.enterWaterPrice'));
        setLoading(false);
        return;
      }
      if (!updatedData.primaryImage) {
        toast.error(t('validation.uploadPrimaryImage'));
        setLoading(false);
        return;
      }

      const payload = new FormData();

      payload.append(
        'boardingHouseType',
        updatedData.boardingHouseType?._id || updatedData.boardingHouseType
      );
      payload.append('name', updatedData.name);
      payload.append('description', updatedData.description || '');
      payload.append('priceRange', updatedData.priceRange);
      payload.append('electricityPrice', updatedData.electricityPrice);
      payload.append('waterPrice', updatedData.waterPrice);
      payload.append('address[province]', updatedData.address.province);
      payload.append('address[district]', updatedData.address.district);
      payload.append('address[ward]', updatedData.address.ward);
      payload.append('address[detail]', updatedData.address.detail);
      payload.append('location[lat]', updatedData.location.lat);
      payload.append('location[lon]', updatedData.location.lon);

      const oldImg = [];

      if (updatedData.primaryImage instanceof File) {
        payload.append('boardingHouse', updatedData.primaryImage);
      } else {
        oldImg.push(updatedData.primaryImage);
      }

      (updatedData.otherImages || []).forEach((file) => {
        if (file instanceof File) {
          payload.append('boardingHouse', file);
        } else {
          oldImg.push(file);
        }
      });

      if (oldImg.length > 0) {
        payload.append('boardingHouse', JSON.stringify(oldImg));
      }

      const response = await updateBoardingHouseDetailsOwner(
        updatedData._id,
        payload
      );

      if (response?.success) {
        toast.success(t('messages.updateSuccess'));
        navigate('/bh-management-owner');
      } else {
        toast.error(response.message || t('messages.updateFailed'));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          t('messages.updateFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!updatedData) return null;

  return (
    <div
      className={`mx-auto w-full back rounded-xl p-4 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-5xl flex items-center gap-2">
        <FontAwesomeIcon
          icon={faHotel}
          className={`text-6xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
        />{' '}
        {boardingHouseName || t('defaultTitle')}
      </h1>
      <Tabs defaultActiveKey="boardingHouseDetail">
        {/* Tab: Boarding House Detail */}
        <Tabs.TabPane
          tab={t('tabs.boardingHouseDetail')}
          key="boardingHouseDetail"
        >
          <div className="mx-auto md:w-[100%]">
            <Form layout="vertical" className="p-6 *:m-7">
              <Form.Item>
                <div className="flex flex-wrap min-[361px]:flex-nowrap justify-between items-center w-full gap-4">
                  {/* Left: Rating & Likes */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) =>
                        index < Math.floor(updatedData.rating || 0) ? (
                          <StarFilled
                            key={index}
                            className="text-yellow-500 text-4xl"
                          />
                        ) : (
                          <StarOutlined
                            key={index}
                            className="text-yellow-500 text-4xl"
                          />
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <HeartFilled className="text-red-500 text-4xl" />
                      <span
                        className={`text-lg ${
                          darkMode ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {' '}
                        {updatedData.likes
                          ? Number(updatedData.likes).toLocaleString('en-US')
                          : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Total & Available Rooms */}
                  <div
                    className={`text-left min-[300px]:text-right min-w-[150px] ${
                      darkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    <div>
                      {t('labels.totalRooms')}: {updatedData.totalRooms || '0'}
                    </div>
                    <div>
                      {t('labels.availableRooms')}:{' '}
                      {updatedData.availableRooms || '0'}
                    </div>
                  </div>
                </div>
              </Form.Item>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Information */}
                <div className="flex flex-col flex-1">
                  <h2
                    className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    {t('form.section.information')}
                  </h2>

                  <Form.Item
                    label={t('form.labels.boardingHouseName')}
                    className="mb-2"
                  >
                    <Input
                      name="name"
                      value={updatedData.name || ''}
                      onChange={handleInputChange}
                      className={cx({ 'dark-mode-input': darkMode })}
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.labels.boardingHouseType')}
                    className="mb-2"
                  >
                    <Select
                      name="boardingHouseType"
                      value={updatedData.boardingHouseType?._id || ''}
                      onChange={(value) =>
                        handleSelectedTypesChange({
                          target: { name: 'boardingHouseType', value },
                        })
                      }
                      className={darkMode ? 'dark-mode-select' : ''}
                    >
                      {boardingHouseTypes.map((type) => (
                        <Select.Option key={type.value} value={type.value}>
                          {type.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={t('form.labels.description')}
                    className="flex-grow"
                  >
                    <Input.TextArea
                      name="description"
                      value={updatedData.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className={`${
                        darkMode ? 'dark-mode-input dark-mode-scroll' : ''
                      }`}
                    />
                  </Form.Item>
                </div>

                {/* Price */}
                <div className="flex flex-col flex-1">
                  <h2
                    className={`text-3xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    {t('form.section.price')}
                  </h2>

                  <Form.Item
                    label={t('form.labels.priceRange')}
                    style={{ marginTop: '10px' }}
                    className="mb-2"
                  >
                    <InputNumber
                      name="priceRange"
                      value={updatedData.priceRange || ''}
                      onChange={(value) =>
                        handleInputChange({
                          target: { name: 'priceRange', value },
                        })
                      }
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      className={darkMode ? 'dark-mode-input' : ''}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.labels.electricityPrice')}
                    className="mb-2"
                  >
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
                      className={darkMode ? 'dark-mode-input' : ''}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.labels.waterPrice')}
                    className="mb-2 flex-grow"
                  >
                    <InputNumber
                      name="waterPrice"
                      value={updatedData.waterPrice || ''}
                      onChange={(value) =>
                        handleInputChange({
                          target: { name: 'waterPrice', value },
                        })
                      }
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      className={darkMode ? 'dark-mode-input' : ''}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </div>
              </div>
              <h2
                className={`text-3xl font-bold mb-4 mt-10 ${
                  darkMode ? 'text-white' : 'text-black'
                }`}
              >
                {t('form.section.images')}
              </h2>

              <Form.Item label={t('form.labels.primaryImage')} className="mb-4">
                <div className="flex flex-col gap-4">
                  {updatedData.primaryImage ? (
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
                          mask: (
                            <span className="text-white">{t('preview')}</span>
                          ),
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePrimaryImage}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                        title={t('buttons.delete')}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <Upload
                      {...uploadProps}
                      listType="picture-card"
                      showUploadList={false}
                      className={
                        darkMode ? 'dark-mode-upload' : 'custom-upload'
                      }
                      name="boardingHouse"
                    >
                      <div
                        className={`rounded-lg p-6 transition text-center ${
                          darkMode ? 'text-white' : ''
                        }`}
                      >
                        <PlusOutlined
                          className={`text-2xl ${
                            darkMode ? 'text-white' : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`${
                            darkMode ? 'text-white' : 'text-gray-500'
                          } mt-2 text-sm font-medium`}
                        >
                          {t('form.labels.addImage')}
                        </p>
                        <p
                          className={`${
                            darkMode ? 'text-white' : 'text-gray-400'
                          } text-xs`}
                        >
                          {t('form.labels.dragDropOrClick')}
                        </p>
                      </div>
                    </Upload>
                  )}
                </div>
              </Form.Item>

              <Form.Item label={t('form.labels.otherImages')} className="mb-4">
                <div className="mt-4 flex flex-wrap gap-4">
                  {(updatedData.otherImages || []).map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={file?.imageUrl || URL.createObjectURL(file)}
                        alt={`Other Image ${index + 1}`}
                        className="object-cover border border-gray-200 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                        width={100}
                        height={100}
                        preview={{
                          mask: (
                            <span className="text-white">{t('preview')}</span>
                          ),
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        title={t('buttons.delete')}
                      >
                        X
                      </button>
                    </div>
                  ))}

                  <Upload
                    {...uploadOtherImgProps}
                    listType="picture-card"
                    showUploadList={false}
                    name="boardingHouse"
                    className={darkMode ? 'dark-mode-upload' : 'custom-upload'}
                  >
                    <div
                      className={`rounded-lg p-6 transition text-center ${
                        darkMode ? 'text-white' : ''
                      }`}
                    >
                      <PlusOutlined
                        className={`text-2xl ${
                          darkMode ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                      <p
                        className={`${
                          darkMode ? 'text-white' : 'text-gray-500'
                        } mt-2 text-sm font-medium`}
                      >
                        {t('form.labels.addOtherImages')}
                      </p>
                      <p
                        className={`${
                          darkMode ? 'text-white' : 'text-gray-400'
                        } text-xs`}
                      >
                        {t('form.labels.dragDropOrClick')}
                      </p>
                    </div>
                  </Upload>
                </div>
              </Form.Item>
              <h2
                className={`text-3xl font-bold mb-4 mt-10 ${
                  darkMode ? 'text-white' : 'text-black'
                }`}
              >
                {t('form.section.address')}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col h-full">
                  <Form.Item label={t('form.labels.province')} required>
                    <Select
                      placeholder={t('form.placeholders.selectProvince')}
                      loading={!provinces.length}
                      value={updatedData?.address?.province || null}
                      onChange={(value) => {
                        handleInputChange({
                          target: { name: 'address.province', value },
                        });
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
                      className={darkMode ? 'dark-mode-select' : ''}
                    >
                      {provinces.map((province) => (
                        <Select.Option
                          key={province.code}
                          value={province.name}
                        >
                          {province.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={t('form.labels.district')} required>
                    <Select
                      placeholder={t('form.placeholders.selectDistrict')}
                      loading={
                        !districts.length && !!updatedData.address?.province
                      }
                      value={updatedData?.address?.district || null}
                      onChange={(value) => {
                        handleInputChange({
                          target: { name: 'address.district', value },
                        });
                        setUpdatedData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            district: value,
                            ward: null,
                          },
                        }));
                      }}
                      disabled={!updatedData.address?.province}
                      allowClear
                      className={darkMode ? 'dark-mode-select' : ''}
                    >
                      {districts.map((district) => (
                        <Select.Option
                          key={district.code}
                          value={district.name}
                        >
                          {district.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={t('form.labels.ward')} required>
                    <Select
                      placeholder={t('form.placeholders.selectWard')}
                      loading={
                        !wards.length && !!updatedData?.address?.district
                      }
                      value={updatedData.address?.ward || null}
                      onChange={(value) => {
                        handleInputChange({
                          target: { name: 'address.ward', value },
                        });
                        setUpdatedData((prev) => ({
                          ...prev,
                          address: { ...prev.address, ward: value },
                        }));
                      }}
                      disabled={!updatedData.address?.district}
                      allowClear
                      className={darkMode ? 'dark-mode-select' : ''}
                    >
                      {wards.map((ward) => (
                        <Select.Option key={ward.code} value={ward.name}>
                          {ward.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={t('form.labels.detailAddress')}>
                    <Input.TextArea
                      name="address.detail"
                      value={updatedData.address?.detail || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className={darkMode ? 'dark-mode-input' : ''}
                    />
                  </Form.Item>
                </div>
                <div className="order-2 lg:order-1 h-full">
                  <LocationPicker
                    className="h-full min-h-[500px] w-full"
                    geoJson={geoLocation?.geojson}
                    initialPosition={currentLocation ?? null}
                    onChange={(lat, lon) => {
                      setUpdatedData((prev) => ({
                        ...prev,
                        location: { lat, lon },
                      }));
                      setGeoLocation({ lat, lon });
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4 w-full md:mt-4">
                <Button
                  type="primary"
                  className="bg-red-500 text-white flex-1"
                  size="large"
                  onClick={() => navigate('/bh-management-owner')}
                  title={t('buttons.back')}
                >
                  {t('buttons.back')}
                </Button>

                <Button
                  type="primary"
                  className="bg-primary text-white flex-1"
                  size="large"
                  loading={loading}
                  onClick={handleSubmit}
                  title={t('buttons.update')}
                >
                  {t('buttons.update')}
                </Button>
              </div>
            </Form>
          </div>
        </Tabs.TabPane>

        {/* Other Tabs */}
        <Tabs.TabPane tab={t('tabs.roomType')} key="roomType">
          <RoomType />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('tabs.room')} key="room">
          <RoomManagement boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('tabs.depositManagement')} key="depositManagement">
          <DepositManagement />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('tabs.tenantManagement')} key="tenantManagement">
          <TenantManagement />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('tabs.revenueManagement')} key="revenueManagement">
          <RevenueManagement boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('tabs.renewalManagement')} key="renewalManagement">
          <RenewalRequest boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={t('tabs.rentPaymentManagement')}
          key="rentPaymentManagement"
        >
          <RentPaymentManagement />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default BHDetailOwner;
