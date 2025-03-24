import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import {
  getAllDepositRooms,
  acceptDepositRoom,
} from '../../../../api/depositManagement';
import { useParams } from 'react-router-dom';
import Table from '@/component/Table';
import formatAmount from '@/utils/formatAmount';
import { Button } from '@/component';
import ConfirmModal from '@/component/ConfirmModal'; // Import ConfirmModal

const DepositRoom = () => {
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for confirmation modal visibility
  const [selectedRoom, setSelectedRoom] = useState(null); // Store selected room for accept action
  const { boardingHouseId } = useParams();
  const fetchDepositedRooms = async () => {
    try {
      const response = await getAllDepositRooms(boardingHouseId);
      setDepositedRooms(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching deposit rooms:', error);
      toast.error('Failed to fetch deposit rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all deposited rooms
  useEffect(() => {
    if (boardingHouseId) {
      fetchDepositedRooms();
    }
  }, [boardingHouseId]);

  // Handle Accept action
  const handleAccept = (record) => {
    setSelectedRoom(record); // Store the selected room
    setIsModalVisible(true); // Open the confirmation modal
  };

  // Confirm accept action (update status to accepted)
  const handleConfirmAccept = async () => {
    try {
      if (!selectedRoom) {
        toast.error('No room selected!');
        return;
      }

      // API call to update deposit status to accepted
      await acceptDepositRoom(selectedRoom._id); // Assuming you pass room ID to accept

      toast.success('Deposit room accepted successfully.');
      setIsModalVisible(false); // Close modal
      fetchDepositedRooms(); // Refresh the list of rooms after accepting
    } catch (error) {
      console.error('Error accepting deposit room:', error);
      toast.error('An error occurred while accepting the deposit room.');
    }
  };

  // Handle cancel modal
  const handleCancelModal = () => {
    setIsModalVisible(false); // Close modal
    setSelectedRoom(null); // Reset selected room
  };

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
      render: (record) =>
        record.status === 'pending' && (
          <div className="flex gap-3 items-center">
            <Button
              title={'Reject'}
              iconPosition="left"
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
              // onClick={() => handleReject(record)} // Open reject modal
            ></Button>

            <Button
              title={'Accept'}
              size="large"
              btnAccept
              className="text-white"
              bgColor="rgb(5 150 105)"
              onClick={() => handleAccept(record)} // Trigger accept action
            ></Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <Table columns={columns} data={depositedRooms || []} loading={loading} />
      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the renewal request for room ${selectedRoom?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalVisible}
      />
    </div>
  );
};

export default DepositRoom;
