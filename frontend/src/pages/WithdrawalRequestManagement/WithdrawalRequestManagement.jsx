import Table from '../../component/Table';
import { toast } from 'react-toastify';
import Loader from '../../component/Loader';
import { useEffect, useState } from 'react';
import { Button, ConfirmModal } from '../../component';
import { Select, Tag } from 'antd';
import { getWithdrawalRequests } from '../../api/withdrawalrequestmanagement';

function WithdrawalRequestManagement() {
  const orderStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const statusColors = {
    Pending: 'orange',
    Completed: 'green',
    Cancelled: 'red',
  };

  const columns = [
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Currency', dataIndex: 'currency', key: 'currency' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    { title: 'Processed By', dataIndex: 'processedBy', key: 'processedBy' },
    {
      title: 'Bank Name',
      dataIndex: 'bankDetails',
      key: 'bankName',
      render: (text) => text?.bankName || 'N/A',
    },
    {
      title: 'Account Number',
      dataIndex: 'bankDetails',
      key: 'accountNumber',
      render: (text) => text?.accountNumber || 'N/A',
    },
    {
      title: 'Account Holder',
      dataIndex: 'bankDetails',
      key: 'accountHolderName',
      render: (text) => text?.accountHolderName || 'N/A',
    },
    {
      title: 'Reason for Cancel',
      dataIndex: 'reasonForCancel',
      key: 'reasonForCancel',
    },
    {
      title: 'Update Status',
      key: 'updateStatus',
      render: (_, record) => (
        <Select
          defaultValue={record.status}
          style={{ width: 120 }}
          onChange={(value) => {
            setSelectedRequest(record._id);
            setNewStatus(value);
            setOpenStatusChangeModal(true);
          }}
        >
          {orderStatusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]); // Make sure data is initialized as an empty array
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openStatusChangeModal, setOpenStatusChangeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWithdrawalRequests();
        console.log('API response:', response);

        if (response && response.data && response.data.length > 0) {
          setData(response.data);
        } else {
          console.error('No data in the response');
          setData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        setData([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = () => {
    console.log(`Updated status for request ${selectedRequest}: ${newStatus}`);
    setOpenStatusChangeModal(false);
    setSelectedRequest(null);
    setNewStatus('');
  };

  const handleMessage = () => {
    toast.success('Add success');
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
              onClick={handleMessage}
              btnAdd
              title="Add new Withdrawal Request"
            />
          </div>
          <div>
            {/* Ensure data is passed correctly */}
            <Table columns={columns} data={data || []} loading={loading} />
          </div>
          <ConfirmModal
            title="Confirm Status Change"
            content={`Do you want to change the status to ${newStatus}?`}
            onOk={handleStatusChange}
            onCancel={() => setOpenStatusChangeModal(false)}
            isOpen={openStatusChangeModal}
          />
          <ConfirmModal
            onCancel={() => setIsOpen(false)}
            isOpen={isOpen}
            content={'Do you want to delete this request?'}
          />
        </>
      )}
    </div>
  );
}

export default WithdrawalRequestManagement;
