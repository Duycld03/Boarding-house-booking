import React, { useEffect, useState } from "react";
import Table from "@/component/Table";
import { Button, ConfirmModal } from "@/component";
import { Avatar } from "antd";
import DefaultRoomImage from "@/assets/images/none_avatar.png";
import { getRoomTypeByBhId, softDeleteRoomType } from "@/api/roomTypeAPI";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import formatAmount from "@/utils/formatAmount";
import AddRoomTypeModal from "./AddRoomType";
import UpdateRoomTypeModal from "./UpdateRoomTypeModal";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import coverFacility from "@/utils/coverFacility";
import { Tooltip } from "antd"; // nếu chưa import

const RoomType = () => {
  const { t } = useTranslation("roomType");
  const { boardingHouseId } = useParams();
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });
  const currentLanguage = i18next.language;

  const fetchRoomTypes = async () => {
    if (!boardingHouseId) {
      toast.error("Boarding House ID is missing!");
      return;
    }
    setLoading(true);
    try {
      const res = await getRoomTypeByBhId(boardingHouseId, paginationOptions);
      if (res?.data && res?.pagination) {
        setRoomData(res.data);
        setPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.pagination.limit,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
      setRoomData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [boardingHouseId, paginationOptions]);

  const handleAddNewData = async () => {
    await fetchRoomTypes();
  };

  const handleOpenUpdateModal = (room) => {
    setSelectedRoom(room);
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setSelectedRoom(null);
  };

  const handleSelectDelete = (room) => {
    setCurrentRecord(room);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!currentRecord?._id) {
        toast.error("Invalid ID");
        return;
      }

      const response = await softDeleteRoomType(currentRecord._id);

      if (
        response?.message === "Room Type deleted successfully (soft delete)."
      ) {
        toast.success(t("toast.deleteSuccess"));
        setRoomData((prev) =>
          prev.filter((room) => room._id !== currentRecord._id)
        );

        if (roomData.length <= 1) {
          fetchRoomTypes();
        }

        setIsDeleteModalVisible(false);
        setCurrentRecord(null);
      }
    } catch (error) {
      console.error("❌ Delete Room Type Error:", error);
      toast.error(
        `Failed to delete Room Type: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPaginationOptions((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const tablePaginationConfig = {
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalItems,
    showSizeChanger: true,
  };

  const columns = [
    {
      title: t("form.image.label") || "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Avatar
          src={image?.imageUrl || DefaultRoomImage}
          shape="square"
          size={64}
        />
      ),
    },
    {
      title: t("form.typeName.label"),
      dataIndex: "typeName",
      key: "typeName",
    },
    {
      title: t("form.facilities.label"),
      dataIndex: "facilities",
      key: "facilities",
      render: (facilities) => {
        if (!facilities || facilities.length === 0)
          return t("form.facilities.placeholder");

        const translated = facilities.map((f) =>
          coverFacility(f.codeName || f.name, currentLanguage)
        );

        const fullText = translated.join(", ");
        const shortText =
          fullText.length > 30 ? `${fullText.slice(0, 30)}...` : fullText;

        return (
          <Tooltip title={fullText}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t("form.roomSize.label"),
      dataIndex: "roomSize",
      key: "roomSize",
    },
    {
      title: t("form.price.label"),
      dataIndex: "price",
      key: "price",
      render: (price) =>
        price ? `${formatAmount(price, currentLanguage)}` : "N/A",
    },
    {
      title: t("form.peopleNumber.label"),
      dataIndex: "peopleNumber",
      key: "peopleNumber",
    },
    {
      title: t("button.action"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            title={t("button.update")}
            btnUpdate
            className={"text-white"}
            onClick={() => handleOpenUpdateModal(record)}
          />
          <Button
            size="large"
            btnDelete
            title={t("button.delete")}
            onClick={() => handleSelectDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between">
        <AddRoomTypeModal
          onAddData={handleAddNewData}
          boardingHouseId={boardingHouseId}
        />
      </div>

      <Table
        tableName={t("tableName")}
        columns={columns}
        data={roomData}
        loading={loading}
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
        noDataText={t("messages.noData")}
      />

      <UpdateRoomTypeModal
        visible={isUpdateModalVisible}
        onClose={handleCloseUpdateModal}
        roomData={selectedRoom}
        onUpdate={fetchRoomTypes}
      />

      <ConfirmModal
        title={t("modal.confirmDeleteTitle")}
        content={t("modal.confirmDeleteContent")}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        isOpen={isDeleteModalVisible}
      />
    </div>
  );
};

export default RoomType;
