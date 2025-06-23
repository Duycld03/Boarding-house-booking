import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tag, Input, Modal, Form } from 'antd';
import { toast } from 'react-toastify';
import {
  getDepositsByOwnerOrStaff,
  acceptDepositRoom,
  rejectDepositRoom,
} from '@/api/depositAPI';
import { getRoomsByBoardingHouse } from '@/api/roomAPI';
import { useParams } from 'react-router-dom';
import Table from '@/component/Table';
import formatAmount from '@/utils/formatAmount';
import { Button } from '@/component';
import ConfirmModal from '@/component/ConfirmModal';
// import FilterDeposit from './FilterDeposite';
import { useTranslation } from 'react-i18next';

const DepositRoom = () => {
  const { t } = useTranslation();
  const { boardingHouseId } = useParams();

  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reasonForCancel, setReasonForCancel] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [listRoom, setListRoom] = useState([]);
  const [filterValue, setFilterValue] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchDepositedRooms = async () => {
    setLoading(true);
    try {
      const res = await getDepositsByOwnerOrStaff({
        ...filterValue,
        ...paginationOptions,
      });
      if (res?.data && res?.pagination) {
        setDepositedRooms(res.data);
        setPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.pagination.limit,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('messages.fetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListRoom = async () => {
    if (!boardingHouseId) return;
    try {
      const response = await getRoomsByBoardingHouse(boardingHouseId);
      setListRoom(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to fetch room list');
    }
  };

  useEffect(() => {
    fetchDepositedRooms();
  }, [filterValue, paginationOptions.page, paginationOptions.limit]);

  useEffect(() => {
    fetchListRoom();
  }, [boardingHouseId]);

  const handleAccept = (record) => {
    setSelectedRoom(record);
    setIsModalVisible(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedRoom) return toast.error('No room selected!');
    setConfirmLoading(true);
    try {
      await acceptDepositRoom(selectedRoom._id);
      toast.success('Deposit room accepted successfully.');
      setIsModalVisible(false);
      fetchDepositedRooms();
    } catch (error) {
      toast.error('An error occurred while accepting the deposit room.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReject = (record) => {
    setSelectedRoom(record);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!reasonForCancel)
      return toast.error('Please provide a reason for rejection');
    setRejectLoading(true);
    try {
      await rejectDepositRoom(selectedRoom._id, reasonForCancel);
      toast.success(
        `Deposit request for room ${selectedRoom.roomNumber} has been rejected.`
      );
      setIsRejectModalOpen(false);
      setReasonForCancel('');
      fetchDepositedRooms();
    } catch (error) {
      toast.error('An error occurred while rejecting the deposit room.');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false);
    setReasonForCancel('');
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
  };

  const handleTableChange = (pagination) => {
    setPaginationOptions((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };
  const tablePaginationConfig = {
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalItems,
    showSizeChanger: true,
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name', // ✅ sửa đúng field "name"
      key: 'name',
    },
    {
      title: 'Boarding House',
      dataIndex: 'boardingHouseName', // ✅ thêm cột nếu muốn
      key: 'boardingHouseName',
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
              onClick={() => handleReject(record)}
            />
            <Button
              title={'Accept'}
              size="large"
              btnAccept
              className="text-white"
              bgColor="rgb(5 150 105)"
              onClick={() => handleAccept(record)}
            />
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end">
        {/* <FilterDeposit setFilterValue={setFilterValue} listRoom={listRoom} /> */}
      </div>
      <Table
        tableName={t('tableName')}
        columns={columns}
        data={depositedRooms} // ✅ Sửa dòng này
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t('messages.noData')}
      />
      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the deposit request for room ${selectedRoom?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalVisible}
        confirmLoading={confirmLoading}
      />
      <Modal
        title="Reject Deposit Request"
        visible={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText="Reject"
        width="400px"
        confirmLoading={rejectLoading}
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
