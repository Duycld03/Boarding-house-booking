import React, { useState, useEffect, useCallback } from "react";
import { Tag, Input, Modal, Form } from "antd";
import { toast } from "react-toastify";
import {
  getDepositsByOwnerOrStaff,
  handleDepositDecision,
  getMaxDeposit,
  getRentTime,
  deleteDepositRoom,
} from "@/api/depositAPI";

import { getAllBHOwner } from "../../../api/BoardingHouseAPI";
import { getRoomsByBoardingHouse } from "@/api/roomAPI";
import { useParams } from "react-router-dom";
import Table from "@/component/Table";
import formatAmount from "@/utils/formatAmount";
import { Button } from "@/component";
import ConfirmModal from "@/component/ConfirmModal";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import formatRentalTime from "@/utils/formatRentalTime";
import FilterDeposit from "./FilterDeposite";

const DepositRoom = () => {
  const { t } = useTranslation("depositManagement");
  const { boardingHouseId } = useParams();
  const currentLanguage = i18next.language;
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reasonForCancel, setReasonForCancel] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [listRoom, setListRoom] = useState([]);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [filterValue, setFilterValue] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [maxDepositAmount, setMaxDepositAmount] = useState();
  const [maxRentalTime, setMaxRentalTime] = useState(12);
  const [filterLoading, setFilterLoading] = useState(false);

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Hàm để lấy danh sách boarding houses
  const fetchBoardingHouses = async () => {
    try {
      // Đầu tiên gọi API để xác định tổng số boarding houses
      const initialResponse = await getAllBHOwner({
        page: 1,
        limit: 10,
      });

      if (!initialResponse?.pagination?.totalItems) {
        toast.error("Failed to get boarding houses count");
        return;
      }

      // Lấy tổng số boarding houses
      const totalItems = initialResponse.pagination.totalItems;

      // Gọi lại API với limit = totalItems để lấy tất cả boarding houses trong một lần
      const response = await getAllBHOwner({
        page: 1,
        limit: totalItems, // Sử dụng totalItems làm limit
      });

      if (response?.data) {
        console.log("Fetched boarding houses:", response.data.length);
        setBoardingHouses(response.data);
      }
    } catch (error) {
      console.error("Error fetching boarding houses:", error);
      toast.error("Failed to fetch boarding houses");
    }
  };

  const fetchDepositedRooms = async () => {
    setLoading(true);
    try {
      const res = await getDepositsByOwnerOrStaff({
        ...filterValue,
        ...paginationOptions,
      });
      if (res?.data && res?.pagination) {
        setDepositedRooms(res.data);
        console.log(res);

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
      toast.error(t("messages.fetchError"));
      setDepositedRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListRoom = async () => {
    if (!boardingHouseId) return;
    try {
      const response = await getRoomsByBoardingHouse(boardingHouseId);

      if (response?.data) {
        setListRoom(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error("Failed to fetch room list");
    }
  };

  // Thêm hàm fetchMaxValues
  const fetchMaxValues = async () => {
    if (!boardingHouseId) return;

    setFilterLoading(true);
    try {
      // Fetch max deposit amount
      const maxDepositResult = await getMaxDeposit(boardingHouseId);

      console.log("Received max deposit amount:", maxDepositResult);

      if (maxDepositResult) {
        setMaxDepositAmount(maxDepositResult);
      }

      // Fetch max rental time
      const maxTimeResult = await getRentTime(boardingHouseId);
      console.log("Received max rental time:", maxTimeResult);

      if (maxTimeResult) {
        setMaxRentalTime(maxTimeResult);
      }
    } catch (error) {
      console.error("Error fetching max values:", error);
      toast.error("Failed to fetch filter range values");
    } finally {
      setFilterLoading(false);
    }
  };

  // Fetch depositedRooms khi filterValue hoặc pagination thay đổi
  useEffect(() => {
    fetchDepositedRooms();
  }, [filterValue, paginationOptions.page, paginationOptions.limit]);

  // Fetch boardingHouses khi component mount
  useEffect(() => {
    fetchBoardingHouses();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (boardingHouseId) {
      fetchListRoom();
      fetchMaxValues();
    }
  }, [boardingHouseId]);

  const handleAccept = (record) => {
    setSelectedRoom(record);
    setIsModalVisible(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedRoom) return toast.error(t("messages.noRoomSelected"));
    setConfirmLoading(true);
    try {
      await handleDepositDecision(selectedRoom._id, "accept");
      toast.success(t("messages.acceptSuccess"));
      setIsModalVisible(false);
      setSelectedRoom(null);
      fetchDepositedRooms();
    } catch (error) {
      toast.error(t("messages.acceptError"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReject = (record) => {
    setSelectedRoom(record);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!reasonForCancel) return toast.error(t("messages.requireReason"));
    setRejectLoading(true);
    try {
      await handleDepositDecision(selectedRoom._id, "reject", reasonForCancel);
      toast.success(
        t("messages.rejectSuccess", { room: selectedRoom.roomNumber })
      );
      setIsRejectModalOpen(false);
      setReasonForCancel("");
      setSelectedRoom(null);
      fetchDepositedRooms();
    } catch (error) {
      toast.error(t("messages.rejectError"));
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false);
    setReasonForCancel("");
  };

  const handleDelete = (record) => {
    setSelectedRoom(record);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoom) return toast.error(t("messages.noRoomSelected"));
    setDeleteLoading(true);
    try {
      await deleteDepositRoom(selectedRoom._id);
      toast.success(
        t("messages.deleteSuccess", { room: selectedRoom.roomNumber })
      );
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
      fetchDepositedRooms();
    } catch (error) {
      console.error("Error deleting deposit:", error);
      toast.error(t("messages.deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Thêm hàm handleCancelDeleteModal
  const handleCancelDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRoom(null);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
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
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("columns.boardingHouse"),
      dataIndex: "boardingHouseName",
      key: "boardingHouseName",
    },
    {
      title: t("columns.roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: t("columns.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (price) =>
        price ? (
          <Tag color="processing">{formatAmount(price, currentLanguage)}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "accepted"
              ? "blue"
              : status === "confirmed"
              ? "green"
              : status === "rejected"
              ? "red"
              : status === "refunded"
              ? "purple"
              : "default"
          }
        >
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t("columns.rentalTime"),
      dataIndex: "rentalTime",
      key: "rentalTime",
      render: (value) => formatRentalTime(value, t),
    },
    {
      title: t("columns.startDate"),
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: t("columns.endDate"),
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: t("columns.action"),
      render: (record) => {
        if (record.status === "pending") {
          return (
            <div className="flex gap-3 items-center">
              <Button
                title={t("actions.reject")}
                iconPosition="left"
                btnReject
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                }}
                onClick={() => handleReject(record)}
              />
              <Button
                title={t("actions.accept")}
                btnAccept
                className="text-white"
                bgColor="rgb(5 150 105)"
                onClick={() => handleAccept(record)}
              />
            </div>
          );
        } else if (
          record.status === "rejected" ||
          record.status === "confirmed" ||
          record.status === "accepted"
        ) {
          return (
            <div className="flex gap-3 items-center">
              <Button
                title={t("actions.delete")}
                iconPosition="left"
                btnDelete
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                }}
                onClick={() => handleDelete(record)}
              />
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-end items-center mb-4">
        <div>
          <FilterDeposit
            setFilterValue={setFilterValue}
            listRoom={listRoom}
            boardingHouses={boardingHouses}
            maxRentalTime={maxRentalTime}
            loading={filterLoading}
            t={t}
          />
        </div>
      </div>

      <Table
        columns={columns}
        tableName={t("tableName")}
        data={depositedRooms}
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t("noData")}
      />

      {/* Accept Modal */}
      <ConfirmModal
        title={t("modal.confirmTitle")}
        content={t("modal.confirmContent", {
          room: selectedRoom?.roomNumber || "",
        })}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalVisible}
        confirmLoading={confirmLoading}
      />

      {/* Reject Modal */}
      <Modal
        title={t("modal.rejectTitle")}
        visible={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText={t("modal.rejectConfirm")}
        width="400px"
        confirmLoading={rejectLoading}
        cancelText={t("modal.cancel")}
      >
        <Form layout="vertical">
          <Form.Item
            label={t("modal.rejectReason")}
            name="reasonForCancel"
            rules={[
              {
                required: true,
                message: t("messages.requireReason"),
              },
            ]}
          >
            <Input.TextArea
              placeholder={t("modal.rejectPlaceholder")}
              value={reasonForCancel}
              onChange={(e) => setReasonForCancel(e.target.value)}
              style={{ width: "100%", height: "100px" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        title={t("modal.deleteTitle")}
        content={t("modal.deleteContent", {
          room: selectedRoom?.roomNumber || "",
        })}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDeleteModal}
        isOpen={isDeleteModalOpen}
        confirmLoading={deleteLoading}
        okText={t("modal.deleteConfirm")}
        cancelText={t("modal.cancel")}
        okButtonProps={{ danger: true }}
      />
    </div>
  );
};

export default DepositRoom;
