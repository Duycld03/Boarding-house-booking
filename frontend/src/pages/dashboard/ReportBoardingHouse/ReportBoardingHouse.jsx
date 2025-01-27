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
  deleteReport,
  sendReplyByEmail,
  getBHReports,
  filterBHReports,
} from '../../../api/reportManagement';
import convertTimetap from '../../../utils/convertTimetap';
import FilterBHReportPopup from './FilterBHReportPopup ';

function ReportBoardingHouse() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReplayPopupOpen, setIsReplayPopupOpen] = useState(false);
  const [replayReportData, setReplayReportData] = useState(null);
  const [filterValue, setFilterValue] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBHReports();
      if (res) {
        setData(res);
        console.log(res);
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
      setLoading(false);
    }
  };

  const filterReportData = async () => {
    setLoading(true);
    try {
      const res = await filterBHReports(filterValue);
      if (res) {
        setData(res);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch filtered reports:', error);
      toast.error('Failed to fetch filtered reports. Please try again later.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  //fetch account data
  useEffect(() => {
    fetchData();
  }, []);

  //Filter BH report
  useEffect(() => {
    filterReportData();
  }, [filterValue]);

  // Define columns for the Table component
  const columns = [
    {
      title: 'Reporter',
      dataIndex: 'reporter',
      key: 'reporter',
      render: (reporter) => reporter?.fullname || 'N/A',
    },
    {
      title: 'Boarding house name',
      dataIndex: 'targetId',
      key: 'email',
      render: (target) => target?.name || 'N/A',
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
      title: 'Processed Date',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => convertTimetap(updatedAt),
    },
    {
      title: 'Action',
      render: (record) => (
        <div className="flex gap-2">
          <Button
            title={'Delete'}
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
          />
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
    setReplayReportData(record);
    setIsReplayPopupOpen(true);
  };

  // Handle deleting a report
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      await deleteReport(selectedRequest._id);
      setData(data.filter((item) => item._id !== selectedRequest._id));
      toast.success('Boarding house report deleted successfully.');
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      toast.error('Failed to delete review report. Please try again later.');
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedRequest(null);
    }
  };

  const handleReplaySubmit = async (formData) => {
    if (!replayReportData || !replayReportData._id) {
      toast.error('Report data is missing. Please try again.');
      return;
    }

    try {
      await sendReplyByEmail(replayReportData._id, {
        status: formData.status,
        detailReport: formData.detailReport,
      });

      setIsReplayPopupOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to fetch filtered reports:', error);
      toast.error(
        'Failed to send reply or update report. Please try again later.'
      );
    }
  };

  return (
    <div className="txt">
      <>
        <div className="flex justify-end mb-4">
          <FilterBHReportPopup setFilterValue={setFilterValue} />
        </div>
        {/* Show filtered data if available, else show full data */}
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
    </div>
  );
}

export default ReportBoardingHouse;
