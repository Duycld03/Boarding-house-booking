import { useEffect, useState } from 'react';
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  Loader,
  FormReplayPopup,
} from '../../../component';
import { toast } from 'react-toastify';
import { Tag } from 'antd';
import {
  getReviewReports,
  deleteReport,
  sendReplyByEmail,
  // filterReports,
} from '../../../api/reportManagement';
import convertTimetap from '../../../utils/convertTimetap';
import FilterReport from './FilterReport';

function ReportReviewManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReplayPopupOpen, setIsReplayPopupOpen] = useState(false); // Replay Popup visibility
  const [replayReportData, setReplayReportData] = useState(null); // Data for the Replay Popup
  const [filterValue, setFilterValue] = useState({
    gender: null,
    role: null,
    startDate: null,
    endDate: null,
    status: null,
  });

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
      title: 'Email',
      dataIndex: 'reporter',
      key: 'eamil',
      render: (reporter) => reporter?.email || 'N/A',
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
      render: (createdAt) => convertTimetap(createdAt),
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
        <div className="flex gap-2">
          {/* Delete Button */}
          <Button
            title={'Delete'}
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
          />
          {/* Replay Button */}
          {record.status !== 'rejected' && record.status !== 'resolved' && (
            <Button
              title={'Replay'}
              btnReplay
              className="btn-replay"
              onClick={() => handleReplay(record)}
            />
          )}
        </div>
      ),
    },
  ];

  // Handle opening the delete modal
  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  // Handle opening the replay popup
  const handleReplay = (record) => {
    console.log('Replay button clicked for record:', record);
    setReplayReportData(record); // Set the selected report data
    setIsReplayPopupOpen(true); // Open the popup
  };
  // Handle deleting a report
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      await deleteReport(selectedRequest._id);
      setData(data.filter((item) => item._id !== selectedRequest._id));
      toast.success('Review report deleted successfully.');
    } catch (error) {
      console.error('Failed to delete review report:', error);
      toast.error('Failed to delete review report. Please try again later.');
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedRequest(null);
    }
  };
  const handleReplaySubmit = async (formData) => {
    console.log('Form Data Submitted:', formData); // Debugging log
    if (!replayReportData || !replayReportData._id) {
      toast.error('Report data is missing. Please try again.');
      return;
    }

    try {
      // Update the report data by calling API
      await sendReplyByEmail(replayReportData._id, {
        status: formData.status,
        detailReport: formData.detailReport,
      });

      // Close the replay popup
      setIsReplayPopupOpen(false);

      // Fetch updated data from the API
      fetchData(); // This will refresh the data from the API
    } catch (error) {
      console.error('Failed to send reply or update report:', error);
      toast.error(
        'Failed to send reply or update report. Please try again later.'
      );
      // Log additional error information for debugging
      if (error.response) {
        console.error('Error Response:', error.response);
      } else if (error.request) {
        console.error('Error Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
    }
  };

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <FilterReport setFilterValue={setFilterValue} />
          </div>
          <Table columns={columns} data={data} loading={loading} />
          <ConfirmModal
            title="Confirm Deletion"
            content="Do you want to delete this review report?"
            onOk={handleDelete}
            onCancel={() => setIsOpenDeleteModal(false)}
            isOpen={isOpenDeleteModal}
          />
          {isReplayPopupOpen && (
            <FormReplayPopup
              visible={isReplayPopupOpen}
              onClose={() => setIsReplayPopupOpen(false)}
              onSubmit={handleReplaySubmit}
              reportData={replayReportData}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ReportReviewManagement;
