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
  getReviewDetail, // Import API mới
} from '../../../api/ReviewManagement';
import FilterReview from './FilterReview';
import { FileTextOutlined } from '@ant-design/icons';
import DetailModal from './DetailModal';

function ReviewManagement() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterValue, setFilterValue] = useState();
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false); // Thêm loading cho modal

  // Gọi API lấy review detail
  const handleDetailModal = async (record) => {
    setDetailLoading(true);
    setIsOpenDetailModal(true); // Mở modal trước

    try {
      const res = await getReviewDetail(record._id);
      console.log('Review detail', res);

      if (res) {
        setSelectedDetail(res);
      } else {
        toast.error('Failed to fetch review details.');
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      toast.error('Error fetching review details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Cấu trúc cột của bảng
  const columns = [
    {
      title: 'Boarding House Name',
      dataIndex: 'boardingHouseId',
      key: 'boardingHouseId',
      render: (house) => house?.name || 'N/A',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <span style={{ color: [rating] }}>{rating} / 5</span>,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-GB'),
    },
    {
      title: 'Reviewer',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (account) => account?.username || 'N/A',
    },
    {
      title: 'Action',
      render: (record) => (
        <div className="flex gap-2">
          <Button
            title={'Delete'}
            size="large"
            btnDelete
            onClick={() => handleDeleteModal(record)}
          >
            Delete
          </Button>
          <Button
            onClick={() => handleDetailModal(record)}
            size="large"
            title={'Detail'}
            icon={<FileTextOutlined />}
            className={'text-white'}
            bgColor={'rgb(5 150 105)'}
          />
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
      console.error('Failed to fetch filtered accounts:', error);
      toast.error('Failed to fetch filtered accounts. Please try again later.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterReview();
  }, [filterValue]);

  // Lấy danh sách review
  const fetchData = async () => {
    try {
      const res = await getReviews();
      if (res) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to fetch reviews. Please try again later.');
      setData([]);
    }
  };

  const handleDeleteModal = (record) => {
    setSelectedReview(record);
    setIsOpenDeleteModal(!isOpenDeleteModal);
  };

  // Hàm xóa review
  const handleDelete = async () => {
    try {
      const response = await deleteReview(selectedReview?._id);
      if (response) {
        setIsOpenDeleteModal(!isOpenDeleteModal);
        fetchData();
        toast.success('Delete review successful');
      } else {
        toast.error('Failed to delete review.');
      }
    } catch (error) {
      toast.error('An error occurred : ', error.response?.data?.error);
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
      <div>
        <Table columns={columns} data={data} loading={loading} />
      </div>

      {/* Modal chi tiết review */}
      <DetailModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        review={selectedDetail}
        loading={detailLoading} // Truyền trạng thái loading
      />

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        title="Confirm Deletion"
        content="Do you want to delete this review?"
        onOk={handleDelete}
        onCancel={() => setIsOpenDeleteModal(false)}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default ReviewManagement;
