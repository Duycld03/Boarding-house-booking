import React, { useState, useEffect } from 'react';
import { TableCustom as Table, Button } from '@/component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import convertTimetap from '@/utils/convertTimetap';
import {
  getRenewalRequestByBhID,
  acceptExtensionRequest,
} from '@/api/renewalRequestManagement';
import { Tag } from 'antd';
import ConfirmModal from '@/component/ConfirmModal';
import { toast } from 'react-toastify';

const RenewalRequest = ({ boardingHouseId }) => {
  // Status colors
  const statusColors = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'red',
  };

  // State for storing requests and modal
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch renewal requests when component mounts
  const fetchRequests = async () => {
    try {
      const response = await getRenewalRequestByBhID(boardingHouseId);
      console.log('API Response:', response);

      if (response?.data?.length > 0) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch renewal requests:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, [boardingHouseId]);

  // Handle Reject action
  const handleReject = (record) => {
    const updatedRequests = requests.map((request) =>
      request.roomNumber === record.roomNumber
        ? { ...request, status: 'rejected' }
        : request
    );
    setRequests(updatedRequests);
    console.log(`Rejected request for room: ${record.roomNumber}`);
  };

  // Handle Accept action
  const handleAccept = (record) => {
    setSelectedRequest(record); // Ensure selectedRequest includes requestId
    setIsModalOpen(true); // Open the confirmation modal
  };

  // Confirm accept action from modal
  const handleConfirmAccept = async () => {
    try {
      if (!selectedRequest?.requestId) {
        console.error('Request ID is missing');
        return;
      }

      // Make the API call to accept the extension request
      await acceptExtensionRequest(selectedRequest?.requestId);
      toast.success('Accepted renewal request successfully.');
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting renewal request:', error);
      toast.error('An error occurred while accepting the renewal request.');
    }
  };

  // Cancel modal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null); // Reset the selected request
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
              title={'Reject'}
              iconPosition="left"
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
              onClick={() => handleReject(record)}
            >
              <FontAwesomeIcon icon={faTimes} /> Reject
            </Button>

            <Button
              title={'Accept'}
              size="large"
              btnAccept
              className="text-white"
              bgColor="rgb(5 150 105)"
              onClick={() => handleAccept(record)} // Trigger accept action
            >
              <FontAwesomeIcon icon={faCheck} /> Accept
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <Table data={requests} columns={columns} loading={loading} />

      {/* Confirmation Modal */}
      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the renewal request for room ${selectedRequest?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalOpen}
      />
    </div>
  );
};

export default RenewalRequest;
