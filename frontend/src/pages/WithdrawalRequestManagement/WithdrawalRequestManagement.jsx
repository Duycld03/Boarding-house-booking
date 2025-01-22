import Table from '../../component/Table';
import { toast } from 'react-toastify';
import Loader from '../../component/Loader';
import { useEffect, useState } from 'react';
import { Button, ConfirmModal } from '../../component';
import { Select, Tag } from 'antd';
import { getWithdrawRequests } from '../../api/withdrawalrequestmanagement';

function WithdrawalRequestManagement() {
  // Order status options (normalized for consistency)
  const orderStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Status colors (normalized keys)
  const statusColors = {
    pending: 'orange',
    processed: 'green',
    cancelled: 'red',
  };

  // Format the amount to a short version like 1K, 1M, 1B
  const formatAmount = (amount) => {
    if (amount >= 1e9) {
      return (amount / 1e9).toFixed(1) + 'B';
    } else if (amount >= 1e6) {
      return (amount / 1e6).toFixed(1) + 'M';
    } else if (amount >= 1e3) {
      return (amount / 1e3).toFixed(1) + 'K';
    }
    return amount;
  };

  // Define table columns
  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => user?.fullname || 'N/A', // Get fullname from populated userId
    },
    {
      title: 'Amount / VND',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatAmount(amount) + ' VND',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status.toLowerCase()]}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Processed By',
      dataIndex: 'processedBy',
      key: 'processedBy',
      render: (processedBy) => processedBy?.fullname || 'N/A', // Get fullname from populated processedBy
    },
  ];

  // State management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openStatusChangeModal, setOpenStatusChangeModal] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true); // Set loading state
      const res = await getWithdrawRequests();
      if (res) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      toast.error(
        'Failed to fetch withdrawal requests. Please try again later.'
      );
      setData([]);
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  // Handle status change confirmation
  const handleStatusChange = () => {
    console.log(`Updated status for request ${selectedRequest}: ${newStatus}`);
    setOpenStatusChangeModal(false);
    setSelectedRequest(null);
    setNewStatus('');
    toast.success('Status updated successfully.');
    fetchData(); // Refresh data after status change
  };

  // Handle component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle delete confirmation
  const handleDelete = () => {
    console.log('Delete request confirmed');
    setIsOpen(false);
    toast.success('Withdrawal request deleted successfully.');
    fetchData(); // Refresh data after deletion
  };

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between">
            <Button
              btnDelete
              title={'Delete Withdrawal Request'}
              size={'large'}
              onClick={() => setIsOpen(true)}
            />
            <Button
              size="large"
              onClick={() => toast.success('Add success')}
              btnAdd
              title="Add new Withdrawal Request"
            />
          </div>
          <div>
            <Table columns={columns} data={data || []} />
          </div>
          <ConfirmModal
            title="Confirm Status Change"
            content={`Do you want to change the status to ${newStatus}?`}
            onOk={handleStatusChange}
            onCancel={() => setOpenStatusChangeModal(false)}
            isOpen={openStatusChangeModal}
          />
          <ConfirmModal
            title="Confirm Deletion"
            content="Do you want to delete this withdrawal request?"
            onOk={handleDelete}
            onCancel={() => setIsOpen(false)}
            isOpen={isOpen}
          />
        </>
      )}
    </div>
  );
}

export default WithdrawalRequestManagement;
