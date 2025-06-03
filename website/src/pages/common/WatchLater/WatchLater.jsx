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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWatchList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllWatchLater({ page, limit: 5 });
      setWatchList(res.data || []);
      setCurrentPage(res.pagination?.currentPage || 1);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch watch later list');
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      await deleteWatchLater(watchLaterId);
      toast.success('Removed from Watch Later');
      fetchWatchList(currentPage); // refresh page
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete item');
    } finally {
      setIsOpenDeleteModal(false);
      setWatchLaterId(null);
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
        <Card bordered={false} className="mb-6 bg-white dark:bg-gray-800">
          <WatchLaterList
            data={watchList}
            onConfirmDelete={() => setIsOpenDeleteModal(true)}
            setSelectedId={setWatchLaterId}
            mode="watchLater"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchWatchList(page)}
          />
        </Card>
      )}

      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to remove this from your Watch Later list?"
        onOk={onRemove}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setWatchLaterId(null);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default WatchLater;
