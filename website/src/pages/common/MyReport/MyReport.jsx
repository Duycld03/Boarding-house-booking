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

  const fetchReport = async () => {
    try {
      const response = await getMyReport();
      setReport(response);
    } catch (error) {
      console.error('Fetch report error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

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
        data={report}
        columns={columns}
        loading={loading}
        onRowClick={handleDetailModal} // ✅ đúng prop mà TableCustom dùng
        rowClassName={() => 'hover:bg-blue-50 cursor-pointer'}
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
