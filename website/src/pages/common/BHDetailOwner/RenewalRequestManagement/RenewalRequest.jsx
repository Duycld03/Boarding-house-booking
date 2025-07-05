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

const RenewalRequest = ({ boardingHouseId }) => {
  const statusColors = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'red',
  };

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

      if (res?.data && res?.pagination) {
        setRequests(res.data);
        // ✅ Sửa key cho đúng
        setPagination({
          currentPage: res?.currentPage || 1,
          totalPages: res?.totalPages || 1,
          totalItems: res?.totalItems || 0,
          limit: res?.limit || 10,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to fetch renewal requests:', error);
      toast.error('Failed to load renewal requests');
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
    setPaginationOptions({
      page: pagination.current,
      limit: pagination.pageSize,
    });
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
        toast.error('Please provide a reason for rejecting.');
        return;
      }

      await rejectExtensionRequest(selectedRequest?.requestId, reasonForCancel);
      toast.success('Request rejected successfully.');
      setIsRejectModalOpen(false);
      setReasonForCancel('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting renewal request:', error);
      toast.error('An error occurred while rejecting the renewal request.');
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
      toast.success('Accepted renewal request successfully.');
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting renewal request:', error);
      toast.error('An error occurred while accepting the renewal request.');
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
      title: 'Tenant Name',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Boarding House',
      dataIndex: 'boardingHouseName',
      key: 'boardingHouseName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Current End Date',
      dataIndex: 'currentEndDate',
      key: 'currentEndDate',
      render: (text) => convertTimetap(text, false),
    },
    {
      title: 'Requested End Date',
      dataIndex: 'requestedEndDate',
      key: 'requestedEndDate',
      render: (text) => convertTimetap(text, false),
    },
    {
      title: 'Action',
      render: (record) =>
        record.status === 'pending' && (
          <div className="flex gap-3 items-center">
            <Button
              title="Reject"
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
              onClick={() => handleReject(record)}
            />
            <Button
              title="Accept"
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
        columns={columns}
        data={requests}
        loading={loading}
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
      />

      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the renewal request for room ${selectedRequest?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalOpen}
      />

      <Modal
        title="Reject Renewal Request"
        open={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText="Reject"
        width="400px"
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

export default RenewalRequest;
