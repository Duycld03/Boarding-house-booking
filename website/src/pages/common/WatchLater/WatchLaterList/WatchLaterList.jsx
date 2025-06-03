import React from 'react';
import { Card, List, Avatar, Rate } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const getPrimaryImage = (images = [], fallbackImages = []) => {
  const source =
    Array.isArray(images) && images.length > 0 ? images : fallbackImages;
  if (!Array.isArray(source) || source.length === 0) {
    return 'https://via.placeholder.com/200';
  }
  const primary = source.find((img) => img?.isPrimary);
  return primary ? primary.imageUrl : source[0].imageUrl;
};

const getAddress = (address) => {
  if (!address) return 'No address';
  const { detail, ward, district, province } = address;
  return `${detail}, ${ward}, ${district}, ${province}`;
};

const WatchLaterList = ({
  data,
  onConfirmDelete,
  setSelectedId,
  mode = 'watchLater', // 'favorite' | 'watchLater'
}) => {
  const navigate = useNavigate();

  const handleRemove = (id) => {
    setSelectedId(id);
    onConfirmDelete();
  };

  const goToDetail = (id) => {
    navigate(`/boarding-house/${id}`);
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => {
        const house = mode === 'watchLater' ? item?.boardingHouseId : item;
        const navigateId =
          mode === 'watchLater'
            ? item?.boardingHouseId?._id
            : item?.boardingHouseId?._id || item?._id || item?.id;

        const itemId =
          mode === 'watchLater' ? item?._id : item?._id || item?.id;

        return (
          <Card
            bordered={false}
            className="mb-4   bg-white dark:bg-gray-800"
            hoverable
            key={itemId}
          >
            <List.Item>
              <div className="text-[18px] mr-4 text-black dark:text-white">
                {index + 1}
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
                      {typeof house?.boardingHouseType === 'object'
                        ? house?.boardingHouseType?.name
                        : house?.boardingHouseType || 'Unknown type'}
                    </p>

                    <Rate
                      disabled
                      defaultValue={house?.rating || item?.rating || 0}
                    />
                    <p>{getAddress(house?.address || item?.address)}</p>
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
  );
};

export default WatchLaterList;
