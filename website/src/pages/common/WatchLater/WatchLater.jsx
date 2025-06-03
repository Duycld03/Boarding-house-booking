import WatchLaterList from './WatchLaterList';
import { Card, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  getAllWatchLater,
  deleteWatchLater,
} from '../../../api/watchLaterManagement';
import { ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';

function WatchLater() {
  const [watchList, setWatchList] = useState([]);
  const [watchLaterId, setWatchLaterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const fetchWatchList = async () => {
    setLoading(true);
    try {
      const res = await getAllWatchLater();
      setWatchList(res || []);
    } catch (error) {
      toast.error('Failed to fetch watch later list');
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      const res = await deleteWatchLater(watchLaterId);
      toast.success('Removed from Watch Later');
      setWatchList((prev) => prev.filter((item) => item._id !== watchLaterId));
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete item');
    }
  };

  useEffect(() => {
    fetchWatchList();
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
            data={watchList}
            onConfirmDelete={() => setIsOpenDeleteModal(true)}
            setSelectedId={setWatchLaterId}
            mode="watchLater"
          />
        </Card>
      )}
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to remove this from your Watch Later list?"
        onOk={() => {
          onRemove();
          setIsOpenDeleteModal(false);
        }}
        onCancel={() => setIsOpenDeleteModal(false)}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default WatchLater;
