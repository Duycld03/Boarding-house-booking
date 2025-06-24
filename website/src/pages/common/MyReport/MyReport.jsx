import { getMyReport } from '@/api/ownerUser/myReport';
import { useEffect, useState } from 'react';
import { TableCustom as Table } from '@/component';
import convertTimetap from '@/utils/convertTimetap';
import { Tag, Tooltip } from 'antd';
import { Button } from '@/component';
import { FileTextOutlined } from '@ant-design/icons';
import DetailReportModal from './DetailReportModal';
import { getOwnReportReviewDetail } from '@/api/reportAPI';
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
      console.log('Fetch report error: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReportDetail = async (reportId) => {
    try {
      const res = await getOwnReportReviewDetail(reportId);
      if (res) {
        setSelectedData(res);
      } else {
        setSelectedData(null);
      }
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      toast.error(t('myReport.fetchError'));
    }
  };

  const handleDetailModal = (record) => {
    fetchReportDetail(record._id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
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
      render: (reason) => t(`reasons.${reason}`) || reason,
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
    {
      title: t('myReport.action'),
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            title={t('myReport.detail')}
            icon={<FileTextOutlined />}
            onClick={() => handleDetailModal(record)}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table data={report} columns={columns} loading={loading} />
      <DetailReportModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        reportData={selectedData}
      />
    </div>
  );
}

export default MyReport;
