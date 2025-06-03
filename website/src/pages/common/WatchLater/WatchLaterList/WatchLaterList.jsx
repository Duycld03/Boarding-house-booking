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

const WatchLaterList = ({ data, onConfirmModal, setWatchLaterId }) => {
  const navigate = useNavigate();

  const onRemove = (id) => {
    onConfirmModal();
    setWatchLaterId(id);
  };

  const goToDetail = (id) => {
    navigate(`/boarding-house/${id}`);
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => {
        const house = item?.boardingHouseId || item; // fallback
        const id = item?.boardingHouseId?._id || item?.id;

        return (
          <Card className="mb-4 hover:shadow-md" hoverable key={id}>
            <List.Item>
              <div style={{ fontSize: 18, marginRight: 16 }}>{index + 1}</div>
              <List.Item.Meta
                onClick={() => goToDetail(id)}
                avatar={
                  <Avatar
                    shape="square"
                    size={100}
                    src={getPrimaryImage(house?.images, house?.img)}
                  />
                }
                title={<strong className="text-3xl">{house?.name}</strong>}
                description={
                  <div className="flex flex-col justify-between">
                    <p>{house?.boardingHouseType?.name}</p>
                    <Rate disabled defaultValue={house?.rating || 0} />
                    <p>{getAddress(house?.address)}</p>
                  </div>
                }
              />
              <CloseOutlined
                style={{ fontSize: 20, color: 'red', cursor: 'pointer' }}
                onClick={() => onRemove(item._id || item.id)}
              />
            </List.Item>
          </Card>
        );
      }}
    />
  );
};

export default WatchLaterList;
