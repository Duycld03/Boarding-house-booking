import React, { useState, useEffect } from 'react';
import { Tag, Input, Modal, Form } from 'antd';
import { toast } from 'react-toastify';
import {
  getDepositByBhId,
  acceptDepositRoom,
  rejectDepositRoom,
} from '@/api/depositAPI';
import { getRoomsByBoardingHouse } from '@/api/roomAPI';
import { useParams } from 'react-router-dom';
import Table from '@/component/Table';
import formatAmount from '@/utils/formatAmount';
import { Button } from '@/component';
import ConfirmModal from '@/component/ConfirmModal';
import FilterDeposit from './FilterDeposite';

const DepositRoom = () => {
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for confirmation modal visibility
  const [confirmLoading, setConfirmLoading] = useState(false); // State to manage loading in confirm modal
  const [selectedRoom, setSelectedRoom] = useState(null); // Store selected room for accept action
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // State for reject modal visibility
  const [reasonForCancel, setReasonForCancel] = useState(''); // Store rejection reason
  const [rejectLoading, setRejectLoading] = useState(false); // State to manage reject button loading state
  const { boardingHouseId } = useParams();
  const [filterValue, setFilterValue] = useState(null);

  const [listRoom, setListRoom] = useState([]);

  const fetchListRoom = async () => {
    try {
      const response = await getRoomsByBoardingHouse(boardingHouseId);
      setListRoom(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to fetch deposit rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositedRooms = async () => {
    try {
      const response = await getDepositByBhId(boardingHouseId, filterValue);
      setDepositedRooms(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching deposit rooms:', error);
      toast.error('Failed to fetch deposit rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardingHouseId) {
      fetchDepositedRooms();
      fetchListRoom();
    }
  }, [boardingHouseId, filterValue]);

  const handleAccept = (record) => {
    setSelectedRoom(record); // Store the selected room
    setIsModalVisible(true); // Open the confirmation modal
  };

  const handleConfirmAccept = async () => {
    if (!selectedRoom) {
      toast.error('No room selected!');
      return;
    }

    setConfirmLoading(true); // Start loading when accepting the room

    try {
      await acceptDepositRoom(selectedRoom._id); // Assuming you pass room ID to accept

      toast.success('Deposit room accepted successfully.');
      setIsModalVisible(false); // Close modal
      fetchDepositedRooms(); // Refresh the list of rooms after accepting
    } catch (error) {
      console.error('Error accepting deposit room:', error);
      toast.error('An error occurred while accepting the deposit room.');
    } finally {
      setConfirmLoading(false); // Stop loading after the action is completed
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false); // Close modal
    setSelectedRoom(null); // Reset selected room
  };

  const handleReject = (record) => {
    setSelectedRoom(record);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!reasonForCancel) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setRejectLoading(true); // Set loading to true when the rejection is processing

    try {
      await rejectDepositRoom(selectedRoom._id, reasonForCancel);

      // Implement the rejection logic (e.g., API call to reject the room)
      toast.success(
        `Deposit request for room ${selectedRoom.roomNumber} has been rejected.`
      );
      setIsRejectModalOpen(false);
      setReasonForCancel('');
      fetchDepositedRooms();
    } catch (error) {
      console.error('Error rejecting deposit room:', error);
      toast.error('An error occurred while rejecting the deposit room.');
    } finally {
      setRejectLoading(false); // Set loading back to false once the rejection is done
    }
  };

  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false);
    setReasonForCancel('');
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
              onClick={() => handleReject(record)} // Open reject modal
            ></Button>

            <Button
              title={'Accept'}
              size="large"
              btnAccept
              className="text-white"
              bgColor="rgb(5 150 105)"
              onClick={() => handleAccept(record)}
            ></Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end">
        <FilterDeposit setFilterValue={setFilterValue} listRoom={listRoom} />
      </div>
      <Table columns={columns} data={depositedRooms || []} loading={loading} />
      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the deposit request for room ${selectedRoom?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalVisible}
        confirmLoading={confirmLoading} // Make sure to pass confirmLoading here
      />

      <Modal
        title="Reject Deposit Request"
        visible={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText="Reject"
        width="400px"
        confirmLoading={rejectLoading} // Add confirm loading to reject modal
      >
        <Form layout="vertical">
          <Form.Item
            label="Reason For Cancel"
            name="reasonForCancel"
            rules={[
              {
                required: true,
                message: 'Please enter a reason for rejection',
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter reason for rejection"
              value={reasonForCancel}
              onChange={(e) => setReasonForCancel(e.target.value)}
              style={{ width: '100%', height: '100px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepositRoom;
