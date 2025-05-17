import { useEffect, useState } from 'react';
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  Loader,
} from '../../../component';
import { toast } from 'react-toastify';
import {
  getReviews,
  filterReviews,
  deleteReview,
  getReviewDetail,
} from '../../../api/ReviewManagement';
import FilterReview from './FilterReview';
import { FileTextOutlined } from '@ant-design/icons';
import DetailModal from './DetailModal.jsx';
import { useTranslation } from 'react-i18next';

function ReviewManagement() {
  const { t } = useTranslation('reviewManagement');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterValue, setFilterValue] = useState();
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleDetailModal = async (record) => {
    setDetailLoading(true);
    setIsOpenDetailModal(true);
    try {
      const res = await getReviewDetail(record._id);
      if (res) {
        setSelectedDetail(res);
      } else {
        toast.error(t('messages.detailFetchError'));
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      toast.error(t('messages.detailFetchError'));
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: t('columns.boardingHouseName'),
      dataIndex: 'boardingHouseId',
      key: 'boardingHouseId',
      render: (house) => house?.name || 'N/A',
    },
    {
      title: t('columns.content'),
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: t('columns.rating'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <span>{rating} / 5</span>,
    },
    {
      title: t('columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-GB'),
    },
    {
      title: t('columns.reviewer'),
      dataIndex: 'accountId',
      key: 'accountId',
      render: (account) => account?.username || 'N/A',
    },
    {
      title: t('columns.action'),
      render: (record) => (
        <div className="flex gap-2">
          <Button
            title={t('buttons.delete')}
            size="large"
            btnDelete
            onClick={() => handleDeleteModal(record)}
          >
            {t('buttons.delete')}
          </Button>
          <Button
            onClick={() => handleDetailModal(record)}
            size="large"
            title={t('buttons.detail')}
            icon={<FileTextOutlined />}
            className="text-white"
            bgColor="rgb(5 150 105)"
          >
            {t('buttons.detail')}
          </Button>
        </div>
      ),
    },
  ];

  const filterReview = async () => {
    setLoading(true);
    try {
      const res = await filterReviews(filterValue);
      if (Array.isArray(res)) {
        setData(res);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch filtered reviews:', error);
      toast.error(t('messages.filterFetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterReview();
  }, [filterValue]);

  const fetchData = async () => {
    try {
      const res = await getReviews();
      setData(res || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error(t('messages.fetchError'));
      setData([]);
    }
  };

  const handleDeleteModal = (record) => {
    setSelectedReview(record);
    setIsOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteReview(selectedReview?._id);
      if (response) {
        setIsOpenDeleteModal(false);
        fetchData();
        toast.success(t('messages.deleteSuccess'));
      } else {
        toast.error(t('messages.deleteFailed'));
      }
    } catch (error) {
      toast.error(t('messages.deleteFailed'));
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  return (
    <div className="txt">
      <div className="flex justify-end mb-4">
        <FilterReview setFilterValue={setFilterValue} />
      </div>
      <Table columns={columns} data={data} loading={loading} />
      <DetailModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        review={selectedDetail}
        loading={detailLoading}
      />
      <ConfirmModal
        title={t('modals.confirmDelete.title')}
        content={t('modals.confirmDelete.content')}
        onOk={handleDelete}
        onCancel={() => setIsOpenDeleteModal(false)}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default ReviewManagement;
