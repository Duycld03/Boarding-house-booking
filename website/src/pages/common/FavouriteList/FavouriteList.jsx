import { useState, useEffect } from "react";
import { Card, Spin } from "antd";
import { getAllFavorites, deleteFavorite } from "../../../api/favoriteAPI";
import { ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import WatchLaterList from "@/pages/common/WatchLater/WatchLaterList";

const FavouriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllFavorites({ page, limit: 5 });
      setFavorites(res.data);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      const response = await deleteFavorite(selectedId);
      toast.success("Deleted favorite successfully");
      await fetchList();
    } catch (error) {
      toast.error("Failed to delete favorite");
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
        <Card bordered={false} className="mb-6 bg-white dark:bg-gray-800">
          <WatchLaterList
            data={favorites}
            onConfirmDelete={() => setIsOpenDeleteModal(true)}
            setSelectedId={setSelectedId}
            mode="favorite"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchList(page)} // <-- Gọi lại API với trang mới
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
