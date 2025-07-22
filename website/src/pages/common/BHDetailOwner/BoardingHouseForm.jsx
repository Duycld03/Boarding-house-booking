import React from 'react';
import { Form, Button, Input, Select, InputNumber, Upload, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '@/component/LocationPicker';
import {
  PlusOutlined,
  HeartFilled,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

const cx = classNames;

const BoardingHouseForm = ({
  updatedData,
  setUpdatedData,
  provinces,
  districts,
  wards,
  managers,
  boardingHouseTypes,
  geoLocation,
  currentLocation,
  darkMode,
  t,
  isOwner,
  loading,
  handleInputChange,
  handleSelectedTypesChange,
  handleFileChange,
  handleRemovePrimaryImage,
  handleRemoveOtherImage,
  handleSubmit,
  uploadProps,
  uploadOtherImgProps,
}) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'vi';
  const selectedManager = managers.find(
    (m) => m._id === updatedData.staffId && !m.isDeleted
  );

  return (
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
                  className={`${darkMode ? 'text-white' : 'text-gray-600'}`}
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
                    {t(`boardingHouseTypes.${type.label}`) || type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {isOwner && (
              <Form.Item label={t('form.labels.manager')}>
                <Select
                  name="staffId"
                  value={selectedManager ? selectedManager._id : undefined}
                  onChange={(value) => {
                    setUpdatedData((prev) => ({
                      ...prev,
                      staffId: value,
                    }));
                  }}
                  className={darkMode ? 'dark-mode-select' : ''}
                  placeholder={t('form.placeholders.selectManager')}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {managers
                    .filter((manager) => !manager.isDeleted)
                    .map((manager) => (
                      <Select.Option key={manager._id} value={manager._id}>
                        {manager.fullname}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            )}

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
              className={`text-3xl font-bold  ${
                darkMode ? 'text-white' : 'text-black'
              }`}
            >
              {t('form.section.price')}
            </h2>

            <Form.Item label={t('form.labels.priceRange')} className="mb-2">
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* Primary Image */}
          <div className="w-full md:w-1/2">
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
                        maxHeight: '530px',
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
                      className="absolute top-2 right-5 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
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
                    className={darkMode ? 'dark-mode-upload' : 'custom-upload'}
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
          </div>

          {/* Other Images */}
          <div className="w-full md:w-1/2">
            <Form.Item label={t('form.labels.otherImages')} className="mb-4">
              <div className="flex flex-wrap gap-4">
                {(updatedData.otherImages || []).map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={file?.imageUrl || URL.createObjectURL(file)}
                      alt={`Other Image ${index + 1}`}
                      className="object-cover border border-gray-200 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                      width={120}
                      height={120}
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
          </div>
        </div>

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
                value={
                  updatedData?.address?.province?.[`name_${lang}`] ||
                  updatedData?.address?.province?.name ||
                  null
                }
                onChange={(value) => {
                  const selected = provinces.find(
                    (p) => p.name[lang] === value
                  );
                  if (selected) {
                    setUpdatedData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        province: {
                          id: selected.id,
                          name: selected.name.vi,
                          name_en: selected.name.en,
                        },
                        district: null,
                        ward: null,
                      },
                    }));
                  }
                }}
                allowClear
                className={darkMode ? 'dark-mode-select' : ''}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.id} value={province.name[lang]}>
                    {province.name[lang]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={t('form.labels.district')} required>
              <Select
                placeholder={t('form.placeholders.selectDistrict')}
                loading={!districts.length && !!updatedData.address?.province}
                value={
                  updatedData?.address?.district?.[`name_${lang}`] ||
                  updatedData?.address?.district?.name ||
                  null
                }
                onChange={(value) => {
                  const selected = districts.find(
                    (d) => d.name[lang] === value
                  );
                  if (selected) {
                    setUpdatedData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        district: {
                          id: selected.id,
                          name: selected.name.vi,
                          name_en: selected.name.en,
                        },
                        ward: null,
                      },
                    }));
                  }
                }}
                disabled={!updatedData.address?.province}
                allowClear
                className={darkMode ? 'dark-mode-select' : ''}
              >
                {districts.map((district) => (
                  <Select.Option key={district.id} value={district.name[lang]}>
                    {district.name[lang]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={t('form.labels.ward')} required>
              <Select
                placeholder={t('form.placeholders.selectWard')}
                loading={!wards.length && !!updatedData?.address?.district}
                value={
                  updatedData?.address?.ward?.[`name_${lang}`] ||
                  updatedData?.address?.ward?.name ||
                  null
                }
                onChange={(value) => {
                  const selected = wards.find((w) => w.name[lang] === value);
                  if (selected) {
                    setUpdatedData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        ward: {
                          id: selected.id,
                          name: selected.name.vi,
                          name_en: selected.name.en,
                        },
                      },
                    }));
                  }
                }}
                disabled={!updatedData.address?.district}
                allowClear
                className={darkMode ? 'dark-mode-select' : ''}
              >
                {wards.map((ward) => (
                  <Select.Option key={ward.id} value={ward.name[lang]}>
                    {ward.name[lang]}
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
  );
};

export default BoardingHouseForm;
