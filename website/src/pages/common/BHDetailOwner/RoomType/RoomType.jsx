import React, { useEffect, useState } from "react";
import Table from "@/component/Table";
import { Button, ConfirmModal } from "@/component";
import { Avatar } from "antd";
import DefaultRoomImage from "@/assets/images/none_avatar.png";
import { FileTextOutlined } from "@ant-design/icons";
import { getRoomTypeByBhId, softDeleteRoomType } from "@/api/roomTypeAPI";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import formatAmount from "@/utils/formatAmount";
import AddRoomTypeModal from "./AddRoomType";
import UpdateRoomTypeModal from "./UpdateRoomTypeModal";

const RoomType = () => {
  const { boardingHouseId } = useParams();
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // ✅ Fetch danh sách RoomType
  const fetchRoomTypes = async () => {
    if (!boardingHouseId) {
      toast.error("Boarding House ID is missing!");
      return;
    }
    setLoading(true);
    try {
      const response = await getRoomTypeByBhId(boardingHouseId);
      if (Array.isArray(response.data)) {
        setRoomData(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch room types:", error);
      // toast.error("Failed to load room types. Please try again.");
      setRoomData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [boardingHouseId]);

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

  // ✅ Hiển thị popup xác nhận khi bấm Delete
  const handleSelectDelete = (room) => {
    setCurrentRecord(room);
    setIsDeleteModalVisible(true);
  };

  // ✅ Xử lý xóa room sau khi xác nhận
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
        toast.success("Room Type deleted successfully!");
        setRoomData((prev) =>
          prev.filter((room) => room._id !== currentRecord._id)
        );

        // 🔥 Chỉ gọi fetchRoomTypes nếu thực sự cần reload danh sách
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

  const columns = [
    {
      title: "Image",
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
      title: "Type Name",
      dataIndex: "typeName",
      key: "typeName",
    },
    {
      title: "Facilities",
      dataIndex: "facilities",
      key: "facilities",
      render: (facilities) =>
        facilities && facilities.length > 0
          ? facilities.map((f) => f.name).join(", ")
          : "No facilities",
    },
    {
      title: "Room Size",
      dataIndex: "roomSize",
      key: "roomSize",
    },
    {
      title: "Rent/month",
      dataIndex: "price",
      key: "price",
      render: (price) => formatAmount(price),
    },
    {
      title: "People Number",
      dataIndex: "peopleNumber",
      key: "peopleNumber",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            title={"Update"}
            btnUpdate
            className={"text-white"}
            onClick={() => handleOpenUpdateModal(record)}
          />
          <Button
            size="large"
            btnDelete
            title={"Delete"}
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
      <Table columns={columns} data={roomData} loading={loading} />
      <UpdateRoomTypeModal
        visible={isUpdateModalVisible}
        onClose={handleCloseUpdateModal}
        roomData={selectedRoom}
        onUpdate={fetchRoomTypes}
      />

      <ConfirmModal
        title="Confirm Deletion"
        content="Do you want to delete this room type?"
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        isOpen={isDeleteModalVisible}
      />
    </div>
  );
};

export default RoomType;
