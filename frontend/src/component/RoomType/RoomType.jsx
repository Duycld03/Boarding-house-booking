import React, { useEffect, useState } from 'react';
import Table from '@/component/Table';
import { Button } from '@/component';
import { Avatar } from 'antd';
import DefaultRoomImage from '@/assets/images/none_avatar.png';
import { FileTextOutlined } from '@ant-design/icons';
import { getRoomTypeByBhId } from '../../api/roomTypeManagement';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom'; // 🔥 Lấy id từ URL
import formatAmount from '@/utils/formatAmount'; // 🔥 Import hàm formatAmount

const RoomType = () => {
  const { boardingHouseId } = useParams();
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log('BH', boardingHouseId);

  // Hàm fetch dữ liệu từ API
  const fetchRoomTypes = async () => {
    if (!boardingHouseId) {
      toast.error('Boarding House ID is missing!');
      return;
    }
    setLoading(true);
    try {
      const response = await getRoomTypeByBhId(boardingHouseId);
      console.log(response);

      if (Array.isArray(response.data)) {
        setRoomData(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      toast.error('Failed to load room types. Please try again.');
      setRoomData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [boardingHouseId]); // 👈 Gọi lại khi boardinghouseId thay đổi

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Avatar
          src={image?.imageUrl || DefaultRoomImage}
          shape="square"
          size={64}
        />
      ),
    },
    {
      title: 'Type Name',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: 'Facilities',
      dataIndex: 'facilities',
      key: 'facilities',
      render: (facilities) =>
        facilities && facilities.length > 0
          ? facilities.map((f) => f.name).join(', ')
          : 'No facilities',
    },
    {
      title: 'Room Size',
      dataIndex: 'roomSize',
      key: 'roomSize',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatAmount(price), // 🔥 Gọi formatAmount
    },
    {
      title: 'People Number',
      dataIndex: 'peopleNumber',
      key: 'peopleNumber',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            title={'Update'}
            icon={<FileTextOutlined />}
            className={'text-white'}
            bgColor={'rgb(5 150 105)'}
          />
          <Button
            size="large"
            btnDelete
            title={'Delete'}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const handleDelete = (record) => {
    setRoomData(roomData.filter((room) => room.id !== record.id));
  };

  return (
    <div className="container mx-auto mt-10 p-5">
      <Table columns={columns} data={roomData} loading={loading} />
    </div>
  );
};

export default RoomType;
