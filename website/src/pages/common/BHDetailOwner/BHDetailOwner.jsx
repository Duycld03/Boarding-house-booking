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
import { getAllBoardingHouseTypesOwner } from '../../../api/BoardingHouseAPI';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from '../../../api/apiAddress';
import { getBoardingHouseDetail } from '../../../api/ownerUser/boardingHouseAPI';
import {
  updateBoardingHouseDetailsOwner,
  getManagersForOwner,
} from '../../../api/BoardingHouseAPI';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { useCurrentUser } from '@/context/userContext';
import userRole from '@/constants/userRole';
import BoardingHouseForm from './BoardingHouseForm';

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
  const [managers, setManagers] = useState([]); // To store the list of managers
  const [geoLocation, setGeoLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { hasRole } = useCurrentUser();

  const isOwner = hasRole(userRole.owner);

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
  useEffect(() => {
    if (isOwner) {
      const fetchManagers = async () => {
        try {
          const response = await getManagersForOwner(); // Fetch managers for owner
          setManagers(response.data || []);
        } catch (error) {
          // console.error('Failed to fetch managers:', error);
          // toast.error(t('errors.fetchManagers'));
        }
      };
      fetchManagers();
    }
  }, [isOwner, t]);

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
      if (updatedData.otherImages.length > 15) {
        toast.error(t('errors.maxOtherImages'));
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
      payload.append('staffId', updatedData.staffId);

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
      console.error('Error updating boarding house details:', error);

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
          <BoardingHouseForm
            updatedData={updatedData}
            setUpdatedData={setUpdatedData}
            provinces={provinces}
            districts={districts}
            wards={wards}
            managers={managers}
            boardingHouseTypes={boardingHouseTypes}
            geoLocation={geoLocation}
            currentLocation={currentLocation}
            darkMode={darkMode}
            t={t}
            isOwner={isOwner}
            loading={loading}
            handleInputChange={handleInputChange}
            handleSelectedTypesChange={handleSelectedTypesChange}
            handleFileChange={handleFileChange}
            handleRemovePrimaryImage={handleRemovePrimaryImage}
            handleRemoveOtherImage={handleRemoveOtherImage}
            handleSubmit={handleSubmit}
            uploadProps={uploadProps}
            uploadOtherImgProps={uploadOtherImgProps}
          />
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
