import { Card, Spin } from "antd";
import React, { useEffect, useState } from "react";
import WatchLaterList from "./WatchLaterList";
import {
  getAllWatchLater,
  deleteWatchLater,
} from "../../../api/watchLaterManagement";
import { ConfirmModal } from "../../../component";
import { toast } from "react-toastify";

function WatchLater() {
  const [watchList, setWatchList] = useState([]);
  const [watchLaterId, setWatchLaterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const fetchWatchList = async () => {
    setLoading(true);
    try {
      const res = await getAllWatchLater();
      setWatchList(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      const res = await deleteWatchLater(watchLaterId);
      fetchWatchList();
    } catch (error) {
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    fetchWatchList();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="mb-6">
          <WatchLaterList
            data={watchList}
            onConfirmModal={() => setIsOpenDeleteModal(true)}
            setWatchLaterId={setWatchLaterId}
          />
        </Card>
      )}
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete this boarding house?`}
        onOk={() => {
          onRemove();
          setIsOpenDeleteModal(false);
        }}
        onCancel={() => {
          setIsOpenDeleteModal(false);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default WatchLater;
