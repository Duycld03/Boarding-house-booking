import { useEffect, useState } from 'react';
import { getMyReport } from '@/api/ownerUser/myReport';
import { getOwnReportReviewDetail } from '@/api/reportAPI';
import { TableCustom as Table } from '@/component';
import convertTimetap from '@/utils/convertTimetap';
import { Tag, Tooltip } from 'antd';
import DetailReportModal from './DetailReportModal';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function MyReport() {
  const { t } = useTranslation('myreport');

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  const [filterValue, setFilterValue] = useState({}); // dùng khi có filter sau này

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await getMyReport({
        ...filterValue,
        ...paginationOptions,
      });

      if (res?.data && res?.pagination) {
        setReport(res.data);
        setPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.pagination.pageSize,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Fetch report error:', error);
      toast.error(t('messages.fetchError'));
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [paginationOptions]);

  const handleDetailModal = async (record) => {
    try {
      const res = await getOwnReportReviewDetail(record._id);
      if (res) {
        setSelectedData(res);
        setIsDetailModalOpen(true);
      } else {
        toast.error(t('myReport.fetchError'));
      }
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      toast.error(t('myReport.fetchError'));
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedData(null);
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
      title: t('myReport.reportType'),
      dataIndex: 'reportType',
      key: 'reportType',
    },
    {
      title: t('myReport.target'),
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: t('myReport.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => t(`reasons.${reason}`, { defaultValue: reason }),
    },
    {
      title: t('myReport.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'pending'
              ? 'orange'
              : status === 'resolved'
              ? 'green'
              : 'red'
          }
        >
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('myReport.details'),
      dataIndex: 'details',
      key: 'details',
      render: (text) => {
        const maxLength = 15;
        const truncated =
          text && text.length > maxLength
            ? text.substring(0, maxLength) + '...'
            : text;
        return (
          <Tooltip title={text}>
            <span>{truncated}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t('myReport.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => convertTimetap(text, false),
    },
  ];

  return (
    <div>
      <Table
        tableName={t('tableName')}
        columns={columns}
        data={report}
        loading={loading}
        onRowClick={handleDetailModal}
        rowClassName={() => 'hover:bg-blue-50 cursor-pointer'}
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
        noDataText={t('messages.noData')}
      />
      <DetailReportModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        reportData={selectedData}
      />
    </div>
  );
}

export default MyReport;
