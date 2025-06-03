import { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import {
  getAllFavorites,
  deleteFavorite,
} from '../../../api/favoriteManagement';
import { ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import WatchLaterList from '@/pages/common/WatchLater/WatchLaterList';

const FavouriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getAllFavorites();
      setFavorites(res.favorites || []);
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      const response = await deleteFavorite(selectedId);
      if (response?.isFavorite === false) {
        toast.success('Deleted favorite successfully');
        await fetchList();
      } else {
        toast.error('Failed to delete favorite');
      }
    } catch (error) {
      toast.error('Failed to delete favorite');
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
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
            onConfirmDelete={() => setIsOpenDeleteModal(true)}
            setSelectedId={setSelectedId}
            mode="favorite"
          />
        </Card>
      )}
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this favorite?"
        onOk={onRemove}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setSelectedId(null);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
};

export default FavouriteList;
