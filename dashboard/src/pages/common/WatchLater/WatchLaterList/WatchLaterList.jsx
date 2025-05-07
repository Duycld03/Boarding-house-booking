import React, { useEffect } from "react";
import { Card, List, Avatar, Rate } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const getPrimaryImage = (images = []) => {
  for (const image of images) {
    if (image?.isPrimary) {
      return image?.imageUrl;
    }
  }
  return images?.[0]?.imageUrl;
};

const getAddress = (address) => {
  const { detail, ward, district, province } = address;
  return `${detail}, ${ward}, ${district}, ${province}`;
};

const WatchLaterList = ({ data, onConfirmModal, setWatchLaterId }) => {
  const navigate = useNavigate();

  const onRemove = (id) => {
    onConfirmModal();
    setWatchLaterId(id);
  };

  const goToDetail = (boardingHouseId) => {
    navigate(`/boarding-house/${boardingHouseId}`);
  };
  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => (
        <Card className="mb-4 hover:shadow-md" hoverable>
          <List.Item>
            <div style={{ fontSize: 18, marginRight: 16 }}>{index + 1}</div>
            <List.Item.Meta
              onClick={() => {
                goToDetail(item?.boardingHouseId._id);
              }}
              avatar={
                <Avatar
                  shape="square"
                  size={100}
                  src={getPrimaryImage(item?.boardingHouseId.images)}
                />
              }
              title={
                <strong className="text-3xl">
                  {item?.boardingHouseId?.name}
                </strong>
              }
              description={
                <div className="flex flex-col justify-between align-between">
                  <p>{item?.boardingHouseId?.boardingHouseType?.name}</p>
                  <Rate disabled defaultValue={item?.boardingHouseId?.rating} />
                  <p>{getAddress(item?.boardingHouseId?.address)}</p>
                </div>
              }
            />
            <CloseOutlined
              style={{ fontSize: 20, color: "red", cursor: "pointer" }}
              onClick={() => onRemove(item._id)}
            />
          </List.Item>
        </Card>
      )}
    />
  );
};

export default WatchLaterList;
