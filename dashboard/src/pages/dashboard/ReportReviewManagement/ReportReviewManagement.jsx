import { useEffect, useState } from 'react';
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  FormReplayPopup,
} from '../../../component';
import { toast } from 'react-toastify';
import { Tag } from 'antd';
import {
  getReviewReports,
  deleteReport,
  sendReplyByEmail,
  filterReviewReports,
  getReportReviewDetail,
} from '../../../api/reportManagement';
import convertTimetap from '../../../utils/convertTimetap';
import FilterReport from './FilterReport';
import { FileTextOutlined } from '@ant-design/icons';
import DetailReportModal from './DetailReportModal';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';

function ReportReviewManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReplayPopupOpen, setIsReplayPopupOpen] = useState(false);
  const [replayReportData, setReplayReportData] = useState(null);
  const [filterValue, setFilterValue] = useState({
    startDate: null,
    endDate: null,
    status: null,
    reason: null,
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const { t } = useTranslation('reviewReportManagement');
  const { darkMode } = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReviewReports();
      if (res) setData(res);
      else setData([]);
    } catch (error) {
      console.error(error);
      toast.error(t('messages.fetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReportData = async () => {
    setLoading(true);
    try {
      const res = await filterReviewReports(filterValue);
      if (res && Array.isArray(res.data)) setData(res.data);
      else throw new Error('Invalid response format');
    } catch (error) {
      console.error(error);
      toast.error(t('messages.fetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (id) => {
    try {
      const res = await getReportReviewDetail(id);
      setSelectedData(res || null);
    } catch (error) {
      console.error(error);
      toast.error(t('messages.detailFetchError'));
    }
  };

  const handleDetailModal = (record) => {
    fetchReportDetail(record._id);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      title: t('columns.reporter'),
      dataIndex: 'reporter',
      key: 'reporter',
      render: (r) => r?.fullname || 'N/A',
    },
    {
      title: t('columns.email'),
      dataIndex: 'reporter',
      key: 'email',
      render: (r) => r?.email || 'N/A',
    },
    {
      title: t('columns.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => t(`reasons.${reason}`) || reason,
    },

    {
      title: t('columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          pending: 'orange',
          resolved: 'green',
          rejected: 'red',
        };
        return (
          <Tag color={statusColors[status.toLowerCase()]}>
            {t(`status.${status}`)}
          </Tag>
        );
      },
    },
    {
      title: t('columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: convertTimetap,
    },
    {
      title: t('columns.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: convertTimetap,
    },
    {
      title: t('columns.action'),
      render: (record) => (
        <div className="flex gap-2">
          <Button
            title={t('buttons.delete')}
            btnDelete
            onClick={() => handleDeleteModal(record)}
          />
          <Button
            title={t('buttons.detail')}
            icon={<FileTextOutlined />}
            className={'text-white'}
            bgColor={'rgb(5 150 105)'}
            onClick={() => handleDetailModal(record)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReportData();
  }, [filterValue]);

  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      await deleteReport(selectedRequest._id);
      setData(data.filter((d) => d._id !== selectedRequest._id));
      toast.success(t('messages.deleteSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('messages.deleteFailed'));
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedRequest(null);
    }
  };

  const handleReplaySubmit = async (formData) => {
    if (!replayReportData || !replayReportData._id || !formData.status) {
      toast.error(t('messages.replayError'));
      return;
    }
    try {
      await sendReplyByEmail(replayReportData._id, {
        status: formData.status,
        detailReport: formData.detailReport,
      });
      fetchData();
      setIsReplayPopupOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('messages.replayFailed'));
    }
  };

  return (
    <div className={`txt ${darkMode ? 'bg-gray-700 text-white' : ''}`}>
      <div className="flex justify-end mb-4">
        <FilterReport setFilterValue={setFilterValue} />
      </div>
      <Table columns={columns} data={data} loading={loading} />
      <DetailReportModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reportData={selectedData}
        onReplay={(record) => {
          setReplayReportData(record);
          setIsReplayPopupOpen(true);
        }}
      />
      <ConfirmModal
        title={t('modals.confirmDelete.title')}
        content={t('modals.confirmDelete.content')}
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
    </div>
  );
}

export default ReportReviewManagement;
