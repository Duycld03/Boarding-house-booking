import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

  // Tách biệt state pagination và pagination options
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

  // State để điều khiển việc hiển thị
  const [showUpdateRoom, setShowUpdateRoom] = useState(false);

  // Ref để handle cancel requests
  const currentRequestRef = useRef(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);

      // Cancel previous request if exists
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel("New request initiated");
      }

      const res = await getRoomsByBoardingHouse(
        boardingHouseId,
        paginationOptions
      );

      if (res) {
        setRooms(res.data || []);

        // Kiểm tra nếu currentPage > totalPages thì reset về trang 1
        if (res.currentPage > res.totalPages && res.totalPages > 0) {
          setPaginationOptions((prev) => ({ ...prev, page: 1 }));
          return;
        }

        setPagination({
          currentPage: res.currentPage,
          totalPages: res.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.limit,
        });
      } else {
        toast.error(t("roomManagement.messages.fetchFailed"));
        // Reset data nếu fetch thất bại
        setRooms([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 10,
        });
      }
    } catch (error) {
      console.error("Fetch rooms error:", error);
      if (error.name !== "CanceledError") {
        toast.error(
          error.response?.data?.message ||
            t("roomManagement.messages.fetchFailed")
        );
        // Reset data khi có lỗi
        setRooms([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 10,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [boardingHouseId, paginationOptions, t]);

  // Effect để fetch data khi pagination options thay đổi
  useEffect(() => {
    if (boardingHouseId) {
      fetchRooms();
    }
  }, [fetchRooms, boardingHouseId]);

  // Clean up requests khi component unmount
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  // Cải thiện pagination config
  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
    }),
    [pagination, t]
  );

  const columns = useMemo(
    () => [
      {
        title: t("roomManagement.table.image"),
        dataIndex: "images",
        key: "images",
        width: 80,
        render: (images) => {
          // Xử lý an toàn cho images
          const imageUrl =
            Array.isArray(images) && images.length > 0
              ? images[0]?.imageUrl
              : images?.imageUrl;

          return imageUrl ? (
            <Image
              src={imageUrl}
              alt={t("roomManagement.table.roomImageAlt")}
              style={{ width: 50, height: 50, objectFit: "cover" }}
              placeholder={
                <div
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Loading...
                </div>
              }
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+s2HLO4MRbYUK5dQRDaJGFyCKISAYEsQQMomxJAwsEZiEYLU0zZPZ5Lp8T1Tmn6qa6v6e6vOcFn6qv7/T0/6P21K0+/vq5l6/8uvcL37/x89efCa4LL4+1LGVZfJMr9X5f//4z7v0/rGCgvbO5/vv7VQI5YH4wPOCN4MHmAe8GjPK/sZkfdWqCTGWgEuRCaBfKQ5lOGZINUTEJIyRBoSxXIciwb0wORhKpODaELYOVIkdZYCr6Nf//2x4YGrw0E8lKVWcEQCFqNJ3KNAYYfJ5CUyGpxpM5QIHJ6CSGQRJV+pz1AUbmtUjVosFIBcbLWEYF3E4CrVPKEwUE5wOHkzZ7uA5QYDI6FS2kBYFYh3sGOBkOcF6X8Q8oMBmdSudQFJJCUpYCJeRaLDUxI8fI4gxNvgHUhfKEAlPR6dAUgqJDcCoP1t7FLfqFLswOHOkEq3UH6VcQFJqKTkun8gikVZ+vKhQTylMb1n6VD1Rps6Uqel7bAAVGo5PRqazuI5G/Cx6EfYl6DqIyMx0gN6M5ZVl6g8QYx7fBTiCjBCMQmIl8O5QFqJ8UIzOhcNNs2cOCJEEhKST8n+uA58pCAg=="
              onError={(e) => {
                console.error("Image load error:", e);
              }}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#999",
                borderRadius: "4px",
              }}
            >
              {t("roomManagement.table.noImage")}
            </div>
          );
        },
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
        render: (tenants) => {
          if (!Array.isArray(tenants) || tenants.length === 0) {
            return <span style={{ color: "#999" }}>-</span>;
          }
          return (
            <span>
              {tenants
                .map(
                  (tenant) =>
                    tenant?.fullname || t("roomManagement.table.unknownTenant")
                )
                .join(", ")}
            </span>
          );
        },
      },
      {
        title: t("roomManagement.table.availability"),
        dataIndex: "isAvailable",
        key: "isAvailable",

        render: (available) => (
          <span
            style={{
              color: available ? "green" : "orange",
              fontWeight: "500",
            }}
          >
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
        sortDirections: ["ascend", "descend"],
        render: (roomType) => (
          <span>
            {roomType?.typeName || t("roomManagement.table.unknownType")}
          </span>
        ),
      },
      {
        title: t("roomManagement.table.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        sortDirections: ["ascend", "descend"],
        defaultSortOrder: "descend",
        render: (text) => convertTimetap(text, false),
      },
    ],
    [t]
  );

  // Hàm xử lý khi click vào row
  const handleRowClick = useCallback((record) => {
    setSelectRoomData(record);
    setShowUpdateRoom(true);
  }, []);

  // Hàm callback khi hoàn thành update hoặc hủy
  const handleUpdateComplete = useCallback(() => {
    setShowUpdateRoom(false);
    setSelectRoomData(null);
    fetchRooms(); // Refresh data
  }, [fetchRooms]);

  // Hàm xử lý khi delete từ UpdateRoomPage
  const handleDeleteFromUpdate = useCallback(
    async (roomId) => {
      if (!roomId) {
        toast.error(t("roomManagement.messages.invalidRoomId"));
        return;
      }

      setLoading(true);
      try {
        const res = await deleteRoom(roomId);
        toast.success(
          res?.message || t("roomManagement.messages.deleteSuccess")
        );
        handleUpdateComplete(); // Quay về danh sách và refresh data
      } catch (error) {
        console.error("Delete room error:", error);
        toast.error(
          error.response?.data?.message ||
            t("roomManagement.messages.deleteFailed")
        );
      } finally {
        setLoading(false);
      }
    },
    [t, handleUpdateComplete]
  );

  // Hàm xử lý khi update từ UpdateRoomPage
  const handleUpdateFromUpdate = useCallback(() => {
    toast.success(t("roomManagement.messages.updateSuccess"));
    handleUpdateComplete(); // Quay về danh sách và refresh data
  }, [t, handleUpdateComplete]);

  // Cải thiện hàm xử lý thay đổi table (pagination, sorting, filtering)
  const handleTableChange = useCallback(
    (newPagination, filters, sorter) => {
      console.log("Table change:", { newPagination, filters, sorter });

      const newPaginationOptions = {
        ...paginationOptions,
        page: newPagination.current,
        limit: newPagination.pageSize,
      };

      // Xử lý sorting
      if (sorter && sorter.field) {
        newPaginationOptions.sortField = sorter.field;
        newPaginationOptions.sortOrder =
          sorter.order === "ascend" ? "asc" : "desc";
      } else if (sorter && !sorter.field) {
        // Reset sorting khi không có sort
        newPaginationOptions.sortField = "createdAt";
        newPaginationOptions.sortOrder = "desc";
      }

      // Xử lý filtering (nếu cần)
      if (filters && Object.keys(filters).length > 0) {
        newPaginationOptions.filters = filters;
      }

      setPaginationOptions(newPaginationOptions);
    },
    [paginationOptions]
  );

  // Hàm refresh data sau khi thêm room mới
  const handleAddRoomSuccess = useCallback(() => {
    // Reset về trang 1 khi thêm mới để thấy item vừa thêm
    setPaginationOptions((prev) => ({ ...prev, page: 1 }));
    fetchRooms();
  }, [fetchRooms]);

  // Early return nếu không có boardingHouseId
  if (!boardingHouseId) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <span>{t("roomManagement.messages.noBoardingHouseId")}</span>
      </div>
    );
  }

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
      <AddRoom
        boardingHouseId={boardingHouseId}
        refreshRoomData={handleAddRoomSuccess}
      />
      <Table
        data={rooms || []}
        tableName={t("roomManagement.table.title")}
        columns={columns}
        pagination={tablePaginationConfig}
        loading={loading}
        onRowClick={handleRowClick}
        onChange={handleTableChange}
        style={{
          cursor: "pointer",
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}

export default RoomManagement;
