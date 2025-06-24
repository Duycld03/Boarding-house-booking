import { useState, useEffect } from "react";
import { TableCustom as Table } from "@/component";
import { getRoomsByBoardingHouse } from "@/api/roomAPI";
import { Image, Space } from "antd";
import convertTimetap from "@/utils/convertTimetap";
import AddRoom from "./AddRoom";
import { toast } from "react-toastify";
import { deleteRoom } from "@/api/ownerUser/boardingHouseAPI";
import UpdateRoomPage from "./UpdateRoom";
import { useTranslation } from "react-i18next";

function RoomManagement({ boardingHouseId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectRoomData, setSelectRoomData] = useState(null);
  const { t } = useTranslation("bhManagement");

  // State để điều khiển việc hiển thị
  const [showUpdateRoom, setShowUpdateRoom] = useState(false);

  //fetch data
  const fetchRooms = async () => {
    const res = await getRoomsByBoardingHouse(boardingHouseId);
    if (res) {
      setRooms(res);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const columns = [
    {
      title: t("roomManagement.table.image"),
      dataIndex: "images",
      key: "images",
      render: (image) => (
        <Image
          src={image?.imageUrl}
          alt={t("roomManagement.table.roomImageAlt")}
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      title: t("roomManagement.table.roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: t("roomManagement.table.tenants"),
      dataIndex: "rentBy",
      key: "tenants",
      render: (tenants) => (
        <span>{tenants.map((tenant) => tenant.fullname).join(", ")}</span>
      ),
    },
    {
      title: t("roomManagement.table.availability"),
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (available) => (
        <span style={{ color: available ? "green" : "orange" }}>
          {available
            ? t("roomManagement.status.available")
            : t("roomManagement.status.occupied")}
        </span>
      ),
    },
    {
      title: t("roomManagement.table.roomType"),
      dataIndex: "roomTypeId",
      key: "roomTypeId",
      render: (roomType) => <span>{roomType?.typeName}</span>,
    },
    {
      title: t("roomManagement.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text, false),
    },
  ];

  // Hàm xử lý khi click vào row
  const handleRowClick = (record) => {
    setSelectRoomData(record);
    setShowUpdateRoom(true);
  };

  // Hàm callback khi hoàn thành update hoặc hủy
  const handleUpdateComplete = () => {
    setShowUpdateRoom(false);
    setSelectRoomData(null);
    fetchRooms(); // Refresh data
  };

  // Hàm xử lý khi delete từ UpdateRoomPage
  const handleDeleteFromUpdate = async (roomId) => {
    setLoading(true);
    try {
      const res = await deleteRoom(roomId);
      toast.success(res.message);
      handleUpdateComplete(); // Quay về danh sách và refresh data
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("roomManagement.messages.deleteFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi update từ UpdateRoomPage
  const handleUpdateFromUpdate = () => {
    toast.success(t("roomManagement.messages.updateSuccess"));
    handleUpdateComplete(); // Quay về danh sách và refresh data
  };

  // Nếu đang hiển thị UpdateRoom, render component đó
  if (showUpdateRoom) {
    return (
      <UpdateRoomPage
        boardingHouseId={boardingHouseId}
        refreshRoomData={handleUpdateComplete}
        roomData={selectRoomData}
        onBack={() => setShowUpdateRoom(false)}
        onDelete={handleDeleteFromUpdate}
        onUpdate={handleUpdateFromUpdate}
      />
    );
  }

  // Render danh sách phòng (mặc định)
  return (
    <div>
      <AddRoom boardingHouseId={boardingHouseId} refreshRoomData={fetchRooms} />
      <Table
        data={rooms || []}
        columns={columns}
        loading={loading}
        onRowClick={(record) => handleRowClick(record)}
        style={{
          cursor: "pointer",
        }}
      />
    </div>
  );
}

export default RoomManagement;
