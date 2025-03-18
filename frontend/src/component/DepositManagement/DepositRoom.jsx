import React, { useState, useEffect } from 'react';
import { Button, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { getAllDepositRooms } from '../../api/depositManagement';
import { useParams } from 'react-router-dom';
import Table from '@/component/Table';
import formatAmount from '@/utils/formatAmount';

const DepositRoom = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [depositRoomId, setDepositRoomId] = useState('');
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { boardingHouseId } = useParams();

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchDepositedRooms = async () => {
      try {
        const response = await getAllDepositRooms(boardingHouseId);
        console.log('Fetched response:', response);

        // Đảm bảo response luôn là mảng
        setDepositedRooms(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching deposit rooms:', error);
        toast.error('Failed to fetch deposit rooms');
        setDepositedRooms([]); // Nếu có lỗi, gán giá trị rỗng để tránh lỗi map()
      } finally {
        setLoading(false);
      }
    };

    if (boardingHouseId) {
      fetchDepositedRooms();
    }
  }, [boardingHouseId]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (price) => (price ? formatAmount(price) : 'N/A'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'pending'
              ? 'orange'
              : status === 'accepted'
              ? 'green'
              : status === 'deleted'
              ? 'volcano'
              : 'red'
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Rental Time',
      dataIndex: 'rentalTime',
      key: 'rentalTime',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Action',
      key: 'action',
      //   render: (_, record) => (
      //     <Button
      //       disabled={record.status === 'pending'}
      //       size="large"
      //       title="Detail"
      //       icon={<FileTextOutlined />}
      //       onClick={() => {
      //         setDepositRoomId(record._id);
      //         setIsModalVisible(true);
      //       }}
      //       className="text-white"
      //       style={{ backgroundColor: 'rgb(5 150 105)', color: 'white' }}
      //     />
      //   ),
    },
  ];

  return (
    <div>
      <Table columns={columns} data={depositedRooms || []} loading={loading} />
    </div>
  );
};

export default DepositRoom;
