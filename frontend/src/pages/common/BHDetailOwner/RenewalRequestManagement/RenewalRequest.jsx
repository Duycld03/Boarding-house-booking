import React, { useState, useEffect } from 'react';
import { TableCustom as Table, Button } from '@/component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import convertTimetap from '@/utils/convertTimetap';
import { getRenewalRequestByBhID } from '@/api/renewalRequestManagement';
import { Tag } from 'antd';

const RenewalRequest = ({ boardingHouseId }) => {
  // Status colors
  const statusColors = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'red',
  };

  // State for storing requests
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch renewal requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getRenewalRequestByBhID(boardingHouseId);
        console.log('API Response:', response); // Log the entire response to check if the structure is correct

        if (response?.data?.length > 0) {
          setRequests(response.data); // Set the fetched data to state
        } else {
          setRequests([]); // If no data or failure
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch renewal requests:', error);
        setLoading(false); // Set loading to false even in case of error
      }
    };

    fetchRequests();
  }, [boardingHouseId]); // Trigger the effect whenever boardingHouseId changes

  // Handle Reject action
  const handleReject = (record) => {
    const updatedRequests = requests.map((request) =>
      request.roomNumber === record.roomNumber
        ? { ...request, status: 'rejected' } // Update status to rejected
        : request
    );
    setRequests(updatedRequests);
    console.log(`Rejected request for room: ${record.roomNumber}`);
  };

  // Handle Accept action
  const handleAccept = (record) => {
    const updatedRequests = requests.map((request) =>
      request.roomNumber === record.roomNumber
        ? { ...request, status: 'accepted' } // Update status to accepted
        : request
    );
    setRequests(updatedRequests);
    console.log(`Accepted request for room: ${record.roomNumber}`);
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
        record.status === 'pending' && ( // Only show buttons for "pending" status
          <div className="flex gap-3 items-center">
            <Button
              title={'Reject'}
              iconPosition="left"
              btnReject
              size="large"
              style={{ backgroundColor: 'red', color: 'white', border: 'none' }} // Button style for red background and white text
              onClick={() => handleReject(record)} // Trigger reject action
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
      <Table
        data={requests} // Ensure you're using dataSource for Ant Design Table
        columns={columns}
        loading={loading}
      />
    </div>
  );
};

export default RenewalRequest;
