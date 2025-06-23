import React, { useState, useEffect, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const DepositRoom = () => {
  const { t } = useTranslation('depositManagement');
  const { boardingHouseId } = useParams();
  const currentLanguage = i18next.language;
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
      setDepositedRooms([]);
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
    if (!selectedRoom) return toast.error(t('messages.noRoomSelected'));
    setConfirmLoading(true);
    try {
      await acceptDepositRoom(selectedRoom._id);
      toast.success(t('messages.acceptSuccess'));
      setIsModalVisible(false);
      fetchDepositedRooms();
    } catch (error) {
      toast.error(t('messages.acceptError'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReject = (record) => {
    setSelectedRoom(record);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!reasonForCancel) return toast.error(t('messages.requireReason'));
    setRejectLoading(true);
    try {
      await rejectDepositRoom(selectedRoom._id, reasonForCancel);
      toast.success(
        t('messages.rejectSuccess', { room: selectedRoom.roomNumber })
      );
      setIsRejectModalOpen(false);
      setReasonForCancel('');
      fetchDepositedRooms();
    } catch (error) {
      toast.error(t('messages.rejectError'));
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
      title: t('columns.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('columns.boardingHouse'),
      dataIndex: 'boardingHouseName',
      key: 'boardingHouseName',
    },
    {
      title: t('columns.roomNumber'),
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: t('columns.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (price) =>
        price ? `${formatAmount(price, currentLanguage)}` : 'N/A',
    },
    {
      title: t('columns.status'),
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
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('columns.rentalTime'),
      dataIndex: 'rentalTime',
      key: 'rentalTime',
    },
    {
      title: t('columns.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: t('columns.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: t('columns.action'),
      render: (record) =>
        record.status === 'pending' && (
          <div className="flex gap-3 items-center">
            <Button
              title={t('modal.rejectConfirm')}
              iconPosition="left"
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
              onClick={() => handleReject(record)}
            />
            <Button
              title={t('modal.confirmTitle')}
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
        data={depositedRooms}
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t('noData')}
      />
      <ConfirmModal
        title={t('modal.confirmTitle')}
        content={t('modal.confirmContent', {
          room: selectedRoom?.roomNumber || '',
        })}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalVisible}
        confirmLoading={confirmLoading}
      />
      <Modal
        title={t('modal.rejectTitle')}
        visible={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText={t('modal.rejectConfirm')}
        width="400px"
        confirmLoading={rejectLoading}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('modal.rejectReason')}
            name="reasonForCancel"
            rules={[
              {
                required: true,
                message: t('messages.requireReason'),
              },
            ]}
          >
            <Input.TextArea
              placeholder={t('modal.rejectPlaceholder')}
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
