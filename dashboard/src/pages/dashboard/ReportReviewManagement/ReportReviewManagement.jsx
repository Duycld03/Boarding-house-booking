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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const { t } = useTranslation('reviewReportManagement');
  const { darkMode } = useTheme();

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

  const filterReportData = async () => {
    setLoading(true);
    try {
      const res = await filterReviewReports({
        ...filterValue,
        ...paginationOptions,
      });
      if (res?.data && res?.pagination) {
        setData(res.data);
        setPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.pagination.limit,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('messages.fetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      await deleteReport(selectedRequest._id);
      toast.success(t('messages.deleteSuccess'));
      filterReportData();
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
      filterReportData();
      setIsReplayPopupOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('messages.replayFailed'));
    }
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
          <Tag color={statusColors[status?.toLowerCase()]}>
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
    filterReportData();
  }, [filterValue, paginationOptions]);

  return (
    <div className={`txt ${darkMode ? 'bg-gray-700 text-white' : ''}`}>
      <div className="flex justify-end mb-4">
        <FilterReport setFilterValue={setFilterValue} />
      </div>
      <Table
        tableName={t('tableName')}
        columns={columns}
        data={data}
        loading={loading}
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
        noDataText={t('messages.noData')}
      />
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
