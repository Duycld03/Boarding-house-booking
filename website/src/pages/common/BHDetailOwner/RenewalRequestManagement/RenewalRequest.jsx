import React, { useState, useEffect } from 'react';
import { TableCustom as Table, Button } from '@/component';
import convertTimetap from '@/utils/convertTimetap';
import {
  getRenewalRequestByBhID,
  acceptExtensionRequest,
  rejectExtensionRequest,
} from '@/api/renewalRequestAPI';
import { Tag, Input, Modal, Form } from 'antd';
import { toast } from 'react-toastify';
import ConfirmModal from '@/component/ConfirmModal';
import { useTranslation } from 'react-i18next';

const RenewalRequest = ({ boardingHouseId }) => {
  const { t } = useTranslation('renewalManagement');

  const statusColors = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'red',
  };

  const statusLabel = (status) => t(`status.${status}`);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reasonForCancel, setReasonForCancel] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getRenewalRequestByBhID(
        boardingHouseId,
        {},
        paginationOptions
      );

      const requestList = res.data || [];
      const paginationInfo = res.pagination || {};

      setRequests(requestList);
      setPagination({
        currentPage: paginationInfo.currentPage || 1,
        totalPages: paginationInfo.totalPages || 1,
        totalItems: paginationInfo.totalItems || 0,
        limit: paginationInfo.limit || 10,
      });
    } catch (error) {
      console.error('❌ Failed to fetch renewal requests:', error);
      toast.error(t('messages.fetchError'));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardingHouseId) {
      fetchRequests();
    }
  }, [boardingHouseId, paginationOptions]);

  const handleReject = (record) => {
    setSelectedRequest(record);
    setIsRejectModalOpen(true);
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

  const handleRejectConfirm = async () => {
    try {
      if (!reasonForCancel) {
        toast.error(t('messages.rejectReasonRequired'));
        return;
      }

      await rejectExtensionRequest(selectedRequest?.requestId, reasonForCancel);
      toast.success(t('messages.rejectSuccess'));
      setIsRejectModalOpen(false);
      setReasonForCancel('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting renewal request:', error);
      toast.error(t('messages.rejectError'));
    }
  };

  const handleAccept = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    try {
      if (!selectedRequest?.requestId) {
        console.error('Request ID is missing');
        return;
      }

      await acceptExtensionRequest(selectedRequest?.requestId);
      toast.success(t('messages.acceptSuccess'));
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting renewal request:', error);
      toast.error(t('messages.acceptError'));
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false);
    setReasonForCancel('');
  };

  const columns = [
    {
      title: t('table.tenantName'),
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: t('table.roomNumber'),
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: t('table.boardingHouse'),
      dataIndex: 'boardingHouseName',
      key: 'boardingHouseName',
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabel(status)}</Tag>
      ),
    },
    {
      title: t('table.currentEndDate'),
      dataIndex: 'currentEndDate',
      key: 'currentEndDate',
      render: (text) => convertTimetap(text, false),
    },
    {
      title: t('table.requestedEndDate'),
      dataIndex: 'requestedEndDate',
      key: 'requestedEndDate',
      render: (text) => convertTimetap(text, false),
    },
    {
      title: t('table.action'),
      render: (record) =>
        record.status === 'pending' && (
          <div className="flex gap-3 items-center">
            <Button
              title={t('action.reject')}
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
              onClick={() => handleReject(record)}
            />
            <Button
              title={t('action.accept')}
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
      <Table
        tableName={t('table.tableName')}
        columns={columns}
        data={requests}
        loading={loading}
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
        noDataText={t('messages.noData')}
      />

      <ConfirmModal
        title={t('modal.confirmTitle')}
        content={t('modal.confirmContent', {
          room: selectedRequest?.roomNumber || '',
        })}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalOpen}
      />

      <Modal
        title={t('modal.rejectTitle')}
        open={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText={t('action.reject')}
        width="400px"
        cancelText={t('action.cancel')}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('form.rejectReason')}
            name="reasonForCancel"
            rules={[
              {
                required: true,
                message: t('form.rejectReasonRequired'),
              },
            ]}
          >
            <Input.TextArea
              placeholder={t('form.rejectReasonPlaceholder')}
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

export default RenewalRequest;
