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
import { useNavigate, useParams } from 'react-router-dom';
import { Back } from '../../../component';
import axios from 'axios';
import LocationPicker from '@/component/LocationPicker';
import RoomType from './RoomType/RoomType';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel } from '@fortawesome/free-solid-svg-icons';
import ViewListAppointmentOwner from "@/component/ViewListAppointmentOwner";
import DepositManagement from '@/pages/common/BHDetailOwner/DepositManagement';
import RenewalRequest from './RenewalRequestManagement/RenewalRequest';
import TenantManagement from './TenantManagement/TenantManagement';
import RoomManagement from './RoomManagement/RoomManagement';
import RevenueManagement from './RevenueManagement';

const BHDetailOwner = () => {
  const { boardingHouseId } = useParams();

  const [updatedData, setUpdatedData] = useState({}); // Updated form data
  const [loading, setLoading] = useState(false); // Loading state
  const [provinces, setProvinces] = useState([]); // Provinces list
  const [districts, setDistricts] = useState([]); // Districts list
  const [wards, setWards] = useState([]); // Wards list
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]); // House types
  const [geoLocation, setGeoLocation] = useState(null); // Geo location
  const [currentLocation, setCurrentLocation] = useState(null); // Current location
  const navigate = useNavigate();
  const location = useLocation();
  const boardingHouseName = location.state?.name || 'Default Name';

  const fetchBoardingHouseDetails = async () => {
    if (!boardingHouseId) {
      toast.error('Boarding house ID not found.');
      navigate('/bh-management-owner');
    }
    try {
      const response = await getBoardingHouseDetail(boardingHouseId);
      const primaryImage = response.images.find((img) => img.isPrimary);
      const otherImages = response.images.filter((img) => !img.isPrimary);
      setUpdatedData({ ...response, primaryImage, otherImages });
      setCurrentLocation([response?.location?.lat, response?.location?.lon]);
    } catch (error) {
      console.error('Failed to fetch boarding house data:', error);
      toast.error('Failed to fetch boarding house data.');
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
      setUpdatedData((prev) => ({
        ...prev,
        primaryImage: file,
      }));
      return;
    }

    if (updatedData.otherImages.length >= 15) {
      toast.error('You can only upload up to 15 other images.');
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
  // Remove other images
  const handleRemoveOtherImage = (index) => {
    setUpdatedData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
    toast.success('Temporary image removed.');
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

      const payload = new FormData();
      if (!updatedData.boardingHouseType) {
        toast.error('Please select a boarding house type.');
        return;
      }
      if (!updatedData.name) {
        toast.error('Please enter a boarding house name.');
        return;
      }
      if (!updatedData.address.province) {
        toast.error('Please select a boarding house province.');
        return;
      }
      if (!updatedData.address.district) {
        toast.error('Please select a boarding house district.');
        return;
      }
      if (!updatedData.address.ward) {
        toast.error('Please select a boarding house ward.');
        return;
      }
      if (!updatedData.address.detail) {
        toast.error('Please enter a boarding house details.');
        return;
      }
      if (!updatedData.priceRange) {
        toast.error('Please enter price range.');
        return;
      }
      if (!updatedData.electricityPrice) {
        toast.error('Please enter electricity price.');
        return;
      }
      if (!updatedData.waterPrice) {
        toast.error('Please enter water price.');
        return;
      }

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
      payload.append('location[lat]', updatedData.location.lat);
      payload.append('location[lon]', updatedData.location.lon);

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

      if (updatedData.otherImages) {
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
      const response = await updateBoardingHouseDetailsOwner(
        updatedData._id, // Boarding house ID
        payload
      );

      if (response?.success) {
        toast.success(
          response.message || 'Boarding house updated successfully.'
        );
        navigate('/bh-management-owner');
      } else {
        toast.error(response?.message || 'Failed to update boarding house.');
      }
    } catch (error) {
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
    <div className="mx-auto w-full back bg-white rounded-xl p-4">
      {' '}
      <h1 className="text-5xl flex items-center gap-2">
        <FontAwesomeIcon icon={faHotel} className="text-gray-500 text-6xl" />{' '}
        {boardingHouseName || 'Default Title'}
      </h1>
      <Tabs defaultActiveKey="boardingHouseDetail">
        {/* Tab: Boarding House Detail */}
        <Tabs.TabPane tab="Boarding House Detail" key="boardingHouseDetail">
          <div className="mx-auto md:w-[100%]">
            <Form
              layout="vertical"
              // onFinish={handleSubmit}
              className="p-6 *:m-7"
            >
              <Form.Item>
                <div className="flex flex-wrap min-[361px]:flex-nowrap justify-between items-center w-full gap-4">
                  {/* Bên trái: Rating & Like (luôn nằm bên trái) */}
                  <div className="flex flex-col items-start gap-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => {
                        if (index < Math.floor(updatedData.rating || 0)) {
                          return (
                            <StarFilled
                              key={index}
                              className="text-yellow-500 text-4xl"
                            />
                          );
                        } else {
                          return (
                            <StarOutlined
                              key={index}
                              className="text-yellow-500 text-4xl"
                            />
                          );
                        }
                      })}
                    </div>

                    {/* Like */}
                    <div className="flex items-center gap-2">
                      <HeartFilled className="text-red-500 text-4xl" />
                      <span className="text-gray-600 text-lg">
                        {updatedData.likes
                          ? Number(updatedData.likes).toLocaleString('en-US')
                          : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Bên phải: Total Rooms & Available Rooms */}
                  <div className="text-left min-[300px]:text-right min-w-[150px]">
                    <div>Total Rooms: {updatedData.totalRooms || '0'}</div>
                    <div>
                      Available Rooms: {updatedData.availableRooms || '0'}
                    </div>
                  </div>
                </div>
              </Form.Item>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Information */}
                <div className="flex flex-col flex-1">
                  <h2 className="text-3xl font-bold">1. Information</h2>
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
                          target: { name: 'boardingHouseType', value },
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

                  <Form.Item label="Description" className="flex-grow">
                    <Input.TextArea
                      name="description"
                      value={updatedData.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </Form.Item>
                </div>

                {/* Price */}
                <div className="flex flex-col flex-1">
                  <h2 className="text-3xl font-bold mb-4">2. Price</h2>
                  <Form.Item
                    label="Price Rent/month (VND)"
                    style={{ marginTop: '10px' }} // Sử dụng object-style đúng cách
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
                      className="w-full"
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Electricity Price/kWh (VND)"
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
                      className="w-full"
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Water Price/m³ (VND)"
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
                      className="w-full"
                      min={0}
                    />
                  </Form.Item>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 mt-10 ">3. Image</h2>
              <Form.Item label="Primary Image" className="mb-4">
                <div className="flex flex-col gap-4">
                  {/* Check if a primary image exists */}
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

                  <Upload
                    {...uploadOtherImgProps}
                    listType="picture-card"
                    showUploadList={false}
                    name="boardingHouse"
                    className="custom-upload"
                  >
                    <div className="rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
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
              <h2 className="text-3xl font-bold mb-4 mt-10">4. Address</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Các thông tin địa chỉ */}
                <div className="flex flex-col h-full">
                  <Form.Item className="mb-4 flex-1">
                    {/* Province */}
                    <Form.Item
                      label="Province"
                      required
                      rules={[
                        { required: true, message: 'Province is required' },
                      ]}
                    >
                      <Select
                        placeholder="Select Province"
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

                    {/* District */}
                    <Form.Item
                      label="District"
                      required
                      rules={[
                        { required: true, message: 'District is required' },
                      ]}
                    >
                      <Select
                        placeholder="Select District"
                        loading={
                          !districts.length && updatedData?.address?.province
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
                        disabled={!updatedData?.address?.province}
                        allowClear
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

                    {/* Ward */}
                    <Form.Item
                      label="Ward"
                      required
                      rules={[{ required: true, message: 'Ward is required' }]}
                    >
                      <Select
                        placeholder="Select Ward"
                        loading={
                          !wards.length && updatedData?.address?.district
                        }
                        value={updatedData?.address?.ward || null}
                        onChange={(value) => {
                          handleInputChange({
                            target: { name: 'address.ward', value },
                          });
                          setUpdatedData((prev) => ({
                            ...prev,
                            address: { ...prev.address, ward: value },
                          }));
                        }}
                        disabled={!updatedData?.address?.district}
                        allowClear
                      >
                        {wards.map((ward) => (
                          <Select.Option key={ward.code} value={ward.name}>
                            {ward.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* Detail Address */}
                    <Form.Item label="Detail">
                      <Input.TextArea
                        name="address.detail"
                        value={updatedData?.address?.detail || ''}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </Form.Item>
                  </Form.Item>
                </div>

                {/* Bản đồ (Map) */}
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

              {/* </div> */}
              <div className="flex justify-center gap-4 w-full md:mt-4">
                <Button
                  className="bg-red-500 text-white flex-1"
                  size="large"
                  onClick={() => navigate('/bh-management-owner')}
                  title="Back"
                >
                  Back
                </Button>

                <Button
                  className="bg-primary text-white flex-1"
                  size="large"
                  loading={loading}
                  onClick={handleSubmit}
                  title="Update"
                >
                  Update
                </Button>
              </div>
            </Form>
          </div>
        </Tabs.TabPane>

        {/* Tab: Room Type */}
        <Tabs.TabPane tab="Room Type" key="roomType">
          <RoomType />
        </Tabs.TabPane>

        {/* Tab: Room */}
        <Tabs.TabPane tab="Room" key="room">
          {/* <Room /> */}
          <RoomManagement boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>

        {/* Tab: Deposit Management */}
        <Tabs.TabPane tab="Deposit Management" key="depositManagement">
          <DepositManagement />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tenant Management" key="Tenant Management">
          <TenantManagement />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Revenue Management" key="Revenue Management">
          <RevenueManagement boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Renewal Management" key="Renewal Request Management">
          <RenewalRequest boardingHouseId={boardingHouseId} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Viewing Room Request" key="viewingroomrequest">
          <ViewListAppointmentOwner />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default BHDetailOwner;
