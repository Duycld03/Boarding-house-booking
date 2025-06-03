import React, { useState } from 'react';
import { Card, List, Avatar, Rate, Button, Typography } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const getPrimaryImage = (images = [], fallbackImages = []) => {
  const source =
    Array.isArray(images) && images.length > 0 ? images : fallbackImages;
  if (!Array.isArray(source) || source.length === 0) {
    return 'https://via.placeholder.com/200';
  }
  const primary = source.find((img) => img?.isPrimary);
  return primary ? primary.imageUrl : source[0].imageUrl;
};

const getAddress = (address, t) => {
  if (!address)
    return t('addressFormat', {
      detail: 'N/A',
      ward: '',
      district: '',
      province: '',
    });
  const { detail, ward, district, province } = address;

  return t('addressFormat', { detail, ward, district, province });
};

const WatchLaterList = ({
  data,
  onConfirmDelete,
  setSelectedId,
  mode = 'watchLater', // 'favorite' | 'watchLater'
  pageSize = 5,
}) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation('common');

  const paginatedData = data.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(data.length / pageSize);

  const handleRemove = (id) => {
    setSelectedId(id);
    onConfirmDelete();
  };

  const goToDetail = (id) => {
    navigate(`/boarding-house/${id}`);
  };

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={paginatedData}
        renderItem={(item, index) => {
          const house = mode === 'favorite' ? item?.boardingHouseId : item;
          const navigateId =
            mode === 'watchLater'
              ? item?.boardingHouseId?._id
              : item?.boardingHouseId?._id || item?._id || item?.id;

          const itemId = item?._id || item?.id;

          return (
            <Card
              bordered={false}
              className="mb-4 bg-white dark:bg-gray-800 transition-colors"
              hoverable
              key={itemId}
            >
              <List.Item>
                <div className="text-[18px] mr-4 text-black dark:text-white">
                  {index + 1 + currentPage * pageSize}
                </div>
                <List.Item.Meta
                  onClick={() => goToDetail(navigateId)}
                  avatar={
                    <Avatar
                      shape="square"
                      size={100}
                      src={getPrimaryImage(house?.images, house?.img)}
                    />
                  }
                  title={
                    <strong className="text-3xl text-black dark:text-white">
                      {house?.name}
                    </strong>
                  }
                  description={
                    <div className="flex flex-col justify-between text-black dark:text-gray-300">
                      <p>
                        {t(
                          `boardingHouseTypes.${
                            typeof house?.boardingHouseType === 'object'
                              ? house?.boardingHouseType?.name
                              : house?.boardingHouseType || 'Unknown'
                          }`
                        )}
                      </p>

                      <Rate
                        disabled
                        defaultValue={house?.rating || item?.rating || 0}
                      />
                      <p>{getAddress(house?.address || item?.address, t)}</p>
                    </div>
                  }
                />
                <CloseOutlined
                  style={{ fontSize: 20, color: 'red', cursor: 'pointer' }}
                  onClick={() => handleRemove(itemId)}
                />
              </List.Item>
            </Card>
          );
        }}
      />

      <div className="flex justify-end items-center mt-4 gap-3">
        <Button
          shape="circle"
          size="middle"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          icon={<LeftOutlined />}
          style={{
            backgroundColor: darkMode ? '#374151' : '#fff',
            border: `1px solid ${darkMode ? '#4B5563' : '#d9d9d9'}`,
            color: darkMode ? '#fff' : '#000',
          }}
        />
        <Typography.Text style={{ color: darkMode ? '#fff' : '#000' }}>
          {currentPage + 1} / {totalPages}
        </Typography.Text>
        <Button
          shape="circle"
          size="middle"
          disabled={currentPage === totalPages - 1}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          icon={<RightOutlined />}
          style={{
            backgroundColor: darkMode ? '#374151' : '#fff',
            border: `1px solid ${darkMode ? '#4B5563' : '#d9d9d9'}`,
            color: darkMode ? '#fff' : '#000',
          }}
        />
      </div>
    </>
  );
};

export default WatchLaterList;
