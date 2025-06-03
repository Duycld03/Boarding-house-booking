import { useState, useEffect } from 'react';
import { Card, Spin, Pagination } from 'antd';
import {
  getAllFavorites,
  deleteFavorite,
} from '../../../api/favoriteManagement';
import { ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import WatchLaterList from '@/pages/common/WatchLater/WatchLaterList'; // bạn có thể rename nếu muốn
import { useNavigate } from 'react-router-dom';

const FavouriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getAllFavorites();
      setFavorites(res.favorites || []); // 💥 Fix ở đây
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteFavorite(selectedFavoriteId);
      fetchList();
    } catch (error) {
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="min-h-[500px]">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="mb-6">
          <WatchLaterList
            data={favorites}
            onConfirmModal={() => setIsOpenDeleteModal(true)}
            setSelectedFavoriteId={setSelectedFavoriteId}
          />
        </Card>
      )}
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete this boarding house?`}
        onOk={() => {
          handleDelete();
          setIsOpenDeleteModal(false);
        }}
        onCancel={() => {
          setIsOpenDeleteModal(false);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
};

export default FavouriteList;
