import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // State để điều khiển việc hiển thị
  const [showUpdateRoom, setShowUpdateRoom] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await getRoomsByBoardingHouse(
        boardingHouseId,
        paginationOptions
      );

      console.log("Fetched rooms:", res);

      if (res) {
        setRooms(res.data || []);
        setLoading(false);
      }
    } catch (error) {
      toast.error(t("messages.fetchFailed"));
    }
  }, [boardingHouseId, paginationOptions, t]);

  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
    }),
    [pagination, t]
  );

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
        tableName={t("roomManagement.table.title")}
        columns={columns}
        pagination={tablePaginationConfig}
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
