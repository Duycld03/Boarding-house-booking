import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Card, Typography, DatePicker, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getRoomAdditionFeesByRoomId,
  deleteRoomAdditionFee,
} from "@/api/roomAdditionFee";

import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import dayjs from "dayjs";
import i18next from "i18next";
import formatAmount from "@/utils/formatAmount";
import AddFee from "./AddFee";
import UpdateFee from "./UpdateFee";

const { Title, Text } = Typography;

function RoomAdditionFeeList({ roomId, onRefresh }) {
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();

  // Current language
  const currentLanguage = i18next.language || "en";

  // State management
  const [feesData, setFeesData] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Update Fee Modal State
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedFeeForUpdate, setSelectedFeeForUpdate] = useState(null);

  //Selected fee delete
  const [selectedFeeForDelete, setSelectedFeeForDelete] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Simplified state - chỉ dùng một state cho pagination
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Ref để handle cancel requests
  const currentFeeRequestRef = useRef(null);

  // ============ FETCH ROOM FEES ============
  const fetchRoomFees = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoadingFees(true);

      // Cancel previous request if exists
      if (currentFeeRequestRef.current) {
        currentFeeRequestRef.current.abort();
      }

      const monthValue = selectedMonth.month() + 1; // dayjs month is 0-indexed
      const yearValue = selectedMonth.year();

      // Create AbortController for request cancellation
      const controller = new AbortController();
      currentFeeRequestRef.current = controller;

      // Tạo pagination options từ state hiện tại
      const paginationOptions = {
        page: paginationState.currentPage,
        limit: paginationState.limit,
        sortField: paginationState.sortField,
        sortOrder: paginationState.sortOrder,
      };

      const response = await getRoomAdditionFeesByRoomId(
        roomId,
        paginationOptions,
        monthValue,
        yearValue,
        { signal: controller.signal }
      );

      if (response) {
        // Set fees data - handle different response structures
        const responseData = response.data || response;
        setFeesData(Array.isArray(responseData) ? responseData : []);

        // Kiểm tra nếu currentPage > totalPages thì reset về trang 1
        if (
          response.currentPage > response.totalPages &&
          response.totalPages > 0
        ) {
          setPaginationState((prev) => ({
            ...prev,
            currentPage: 1,
          }));
          return;
        }

        // Update pagination state
        setPaginationState((prev) => ({
          ...prev,
          currentPage: response.currentPage || prev.currentPage,
          totalPages: response.totalPages || 1,
          totalItems:
            response.pagination?.totalItems || response.totalItems || 0,
          limit: response.limit || prev.limit,
        }));
      } else {
        toast.error(t("roomAdditionFee.messages.error.fetchFees"));
        // Reset data nếu fetch thất bại
        setFeesData([]);
        setPaginationState((prev) => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching room fees:", error);

      if (error.name !== "AbortError" && error.name !== "CanceledError") {
        if (error.response?.status === 404) {
          // No fees found - this is normal, không hiển thị error
          setFeesData([]);
          setPaginationState((prev) => ({
            ...prev,
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
          }));
        } else {
          toast.error(
            error.response?.data?.message ||
              t("roomAdditionFee.messages.error.fetchFees")
          );
          // Reset data khi có lỗi
          setFeesData([]);
          setPaginationState((prev) => ({
            ...prev,
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          }));
        }
      }
    } finally {
      setLoadingFees(false);
      currentFeeRequestRef.current = null;
    }
  }, [
    roomId,
    paginationState.currentPage,
    paginationState.limit,
    paginationState.sortField,
    paginationState.sortOrder,
    selectedMonth,
    t,
  ]);

  // ============ TABLE CHANGE HANDLER ============
  const handleTableChange = useCallback((newPagination, filters, sorter) => {
    console.log("Table change:", { newPagination, filters, sorter }); // Debug log

    setPaginationState((prev) => {
      const newState = {
        ...prev,
        currentPage: newPagination.current || prev.currentPage,
        limit: newPagination.pageSize || prev.limit,
      };

      // Xử lý sorting
      if (sorter && sorter.field) {
        newState.sortField = sorter.field;
        newState.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      } else if (sorter && !sorter.field) {
        // Reset sorting khi không có sort
        newState.sortField = "createdAt";
        newState.sortOrder = "desc";
      }

      console.log("New pagination state:", newState); // Debug log
      return newState;
    });
  }, []);

  // ============ UPDATE HANDLERS ============
  const handleUpdateFee = useCallback((feeRecord) => {
    setSelectedFeeForUpdate(feeRecord);
    setUpdateModalVisible(true);
  }, []);

  const handleCloseUpdateModal = useCallback(() => {
    setUpdateModalVisible(false);
    setSelectedFeeForUpdate(null);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    handleCloseUpdateModal();
    refreshFeesData();
  }, []);

  // ============ OTHER HANDLERS ============
  const handleMonthChange = useCallback((date) => {
    if (!date) return;

    setSelectedMonth(date);
    // Reset về trang 1 khi thay đổi month
    setPaginationState((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  // ============ PUBLIC METHODS ============
  const refreshFeesData = useCallback(() => {
    // Reset về trang 1 khi refresh để thấy data mới nhất
    setPaginationState((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    // Trigger fetch lại data
    fetchRoomFees();
  }, [fetchRoomFees]);

  // ============ EFFECTS ============
  // Effect để fetch data khi pagination state thay đổi
  useEffect(() => {
    if (roomId) {
      fetchRoomFees();
    }
  }, [fetchRoomFees]);

  // Clean up requests khi component unmount
  useEffect(() => {
    return () => {
      if (currentFeeRequestRef.current) {
        currentFeeRequestRef.current.abort();
      }
    };
  }, []);

  // Expose refresh method to parent via onRefresh callback
  useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshFeesData);
    }
  }, [onRefresh, refreshFeesData]);

  // ============ MEMOIZED VALUES ============
  // Pagination config cho Table
  const tablePaginationConfig = useMemo(
    () => ({
      current: paginationState.currentPage,
      pageSize: paginationState.limit,
      total: paginationState.totalItems,
    }),
    [paginationState, t]
  );

  const handleOpenDelete = (record) => {
    setSelectedFeeForDelete(record);
    setDeleteModalVisible(true);
  };

  // Table columns với sorting support
  const feesColumns = useMemo(
    () => [
      {
        title: t("roomAdditionFee.form.feeName"),
        dataIndex: "feeName",
        key: "feeName",
        render: (text) => (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {text || t("roomAdditionFee.table.unknownFee")}
          </span>
        ),
      },
      {
        title: t("roomAdditionFee.form.feeAmount"),
        dataIndex: "feeAmount",
        key: "feeAmount",
        render: (amount) => (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatAmount(amount, currentLanguage) || "-"}
          </span>
        ),
      },
      {
        title: t("roomAdditionFee.table.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",

        render: (date) => (
          <span className="text-gray-600 dark:text-gray-300">
            {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"}
          </span>
        ),
      },
      {
        title: t("roomAdditionFee.table.columns.actions"),
        key: "actions",
        render: (text, record) => (
          <Space>
            <Button
              title={t("roomAdditionFee.editFee")}
              btnUpdate
              onClick={() => handleUpdateFee(record)}
              loading={false}
            />
            <Button
              title={t("roomAdditionFee.deleteFee")}
              btnDelete
              onClick={() => handleOpenDelete(record)}
              loading={false}
            />
          </Space>
        ),
      },
    ],
    [
      t,
      currentLanguage,
      paginationState.sortField,
      paginationState.sortOrder,
      handleUpdateFee,
    ]
  );

  // ============ UTILITY FUNCTIONS ============
  const getContentBgClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getTextColor = () => {
    return darkMode ? "text-gray-200" : "text-gray-800";
  };

  // ============ EARLY RETURNS ============
  if (!roomId) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <span>{t("roomAdditionFee.messages.noRoomId")}</span>
      </div>
    );
  }

  //Delete function
  const handleDeleteFee = async () => {
    if (!selectedFeeForDelete) return;
    try {
      await deleteRoomAdditionFee(selectedFeeForDelete._id);
      setDeleteModalVisible(false);
      fetchRoomFees(); // Refresh fees data after deletion
      toast.success(t("roomAdditionFee.messages.success.feeDeleted"));
      setSelectedFeeForDelete(null);
      refreshFeesData();
    } catch (error) {
      toast.error(t("roomAdditionFee.messages.error.feeDeleted"));
    }
  };

  return (
    <div>
      <Card
        className={`${getContentBgClasses()} border-2 shadow-lg rounded-xl`}
        title={
          <div className="space-y-3">
            <Title level={4} className="text-gray-800 dark:text-white mb-0">
              {t("roomAdditionFee.title")}
            </Title>
            <AddFee roomId={roomId} onAdd={refreshFeesData} />
          </div>
        }
        extra={
          <div className="flex items-center gap-3">
            <Text className={getTextColor()}>
              {t("roomAdditionFee.form.month")}:
            </Text>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              format="MM/YYYY"
              placeholder={t("roomAdditionFee.placeholder.selectMonth")}
              className={
                darkMode
                  ? "[&_.ant-picker-input>input]:bg-gray-700 [&_.ant-picker-input>input]:border-gray-600 [&_.ant-picker-input>input]:text-gray-200"
                  : ""
              }
            />
          </div>
        }
      >
        <Table
          columns={feesColumns}
          data={feesData || []}
          loading={loadingFees}
          pagination={tablePaginationConfig}
          onChange={handleTableChange}
          tableName={t("roomAdditionFee.feeList")}
          scroll={{ x: 800 }}
          noDataText={t("roomAdditionFee.messages.noData")}
        />
      </Card>

      {/* Update Fee Modal */}
      <UpdateFee
        feeData={selectedFeeForUpdate}
        visible={updateModalVisible}
        onClose={handleCloseUpdateModal}
        onUpdate={handleUpdateSuccess}
      />

      <ConfirmModal
        title={t("roomAdditionFee.messages.confirm.deleteFee")}
        isOpen={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteFee}
      />
    </div>
  );
}

export default RoomAdditionFeeList;
