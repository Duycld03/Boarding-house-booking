import Table from '../../component/Table';
import { toast } from 'react-toastify';
import Loader from '../../component/Loader';
import { useEffect, useState } from 'react';
import { Button, ConfirmModal } from '../../component';
import { Tag } from 'antd';
import convertTimetap from '../../utils/convertTimetap'; // Import the convertTimetap function
import { getReviewReports } from '../../api/reportManagement'; // Import getReviewReports from the API file

function ReportReviewManagement() {
  const [data, setData] = useState([]); // Initializing with an empty array
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const res = await getReviewReports();
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
    }
  };

  // Call fetchData on component mount
  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });
  }, []);

  // Define columns for the Table component
  const columns = [
    {
      title: 'Reporter',
      dataIndex: 'reporter',
      key: 'reporter',
      render: (reporter) => reporter?.fullname || 'N/A',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          pending: 'orange',
          'in progress': 'blue',
          resolved: 'green',
          rejected: 'red',
        };
        return <Tag color={statusColors[status.toLowerCase()]}>{status}</Tag>;
      },
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => convertTimetap(createdAt), // Format timestamp
    },
    {
      title: 'Processed by',
      dataIndex: 'processedBy',
      key: 'processedBy',
      render: (processedBy) => processedBy?.fullname || 'N/A',
    },
    {
      title: 'Action',
      render: (record) => (
        <Button
          title={'Delete'}
          btnDelete
          className="btn-delete"
          onClick={() => handleDeleteModal(record)}
        />
      ),
    },
  ];

  // Handle opening the delete modal
  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  // Handle deleting a report
  const handleDelete = () => {
    // Simulate deleting a report
    setData(data.filter((item) => item._id !== selectedRequest._id));
    setIsOpenDeleteModal(false);
    setSelectedRequest(null);
    toast.success('Review report deleted successfully.');
  };

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Button
              btnFilter
              size="large"
              onClick={() => toast.success('Filter success')}
              title={'Filter'}
            />
          </div>
          <Table columns={columns} data={data} loading={loading} />
          <ConfirmModal
            title="Confirm Deletion"
            content="Do you want to delete this review report?"
            onOk={handleDelete}
            onCancel={() => setIsOpenDeleteModal(false)}
            isOpen={isOpenDeleteModal}
          />
        </>
      )}
    </div>
  );
}

export default ReportReviewManagement;
