import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, ConfirmModal } from '../../../component';
import Table from '../../../component/Table';
import { toast } from 'react-toastify';
import {
  filterReviews,
  deleteReview,
  getReviewDetail,
} from '../../../api/reviewAPI';
import FilterReview from './FilterReview';
import { FileTextOutlined } from '@ant-design/icons';
import DetailModal from './DetailModal';
import { useTranslation } from 'react-i18next';
import convertTimetap from '../../../utils/convertTimetap';

function ReviewManagement() {
  const { t } = useTranslation('reviewManagement');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterValue, setFilterValue] = useState({});
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const handleDetailModal = async (record) => {
    setDetailLoading(true);
    setIsOpenDetailModal(true);
    try {
      const res = await getReviewDetail(record._id);
      console.log('📥 Review Detail:', res.data);

      if (res?.data?.review) {
        // 👉 Gộp replies vào review để truyền xuống DetailModal
        const reviewWithReplies = {
          ...res.data.review,
          replies: res.data.replies || [],
        };
        setSelectedDetail(reviewWithReplies);
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

  const columns = useMemo(
    () => [
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
        render: (createdAt) => convertTimetap(createdAt),
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
            />
            <Button
              onClick={() => handleDetailModal(record)}
              size="large"
              title={t('buttons.detail')}
              icon={<FileTextOutlined />}
              className="text-white"
              bgColor="rgb(5 150 105)"
            />
          </div>
        ),
      },
    ],
    [t]
  );

  const handleTableChange = useCallback((pagination) => {
    setPaginationOptions((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  }, []);

  const filterReview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await filterReviews(filterValue, paginationOptions);

      if (res && res.data && res.pagination) {
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
      console.error('❌ API error:', error);
      toast.error(t('messages.filterFetchError'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filterValue, paginationOptions, t]);

  useEffect(() => {
    filterReview();
  }, [filterReview]);

  const handleDeleteModal = (record) => {
    setSelectedReview(record);
    setIsOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteReview(selectedReview?._id);
      if (response) {
        setIsOpenDeleteModal(false);
        filterReview();
        toast.success(t('messages.deleteSuccess'));
      } else {
        toast.error(t('messages.deleteFailed'));
      }
    } catch (error) {
      toast.error(t('messages.deleteFailed'));
    }
  };

  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
    }),
    [pagination]
  );

  return (
    <div className="txt">
      <div className="flex justify-end mb-4">
        <FilterReview setFilterValue={setFilterValue} />
      </div>

      <Table
        tableName={t('tableName')}
        columns={columns}
        data={data}
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t('messages.noData')}
      />

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
