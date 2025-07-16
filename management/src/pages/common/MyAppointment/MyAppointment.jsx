import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getAppointmentOfUser,
  updateAppointmentStatus,
} from "../../../api/appointmentAPI";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import convertTimetap from "../../../utils/convertTimetap";
import { Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

function MyAppointment() {
  const [appointmentData, setAppointmentData] = useState([]);
  const { t } = useTranslation("myAppointment");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  const [selectedData, setSelectedData] = useState(null);
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

  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
    }),
    [pagination]
  );

  const statusColors = {
    pending: "blue",
    accepted: "orange",
    rejected: "red",
    completed: "green",
  };

  const appointmentCol = [
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Boarding House Name",
      dataIndex: "boardingHouseName",
      key: "boardingHouseName",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => convertTimetap(date, true),
    },
    {
      title: "User Note",
      dataIndex: "note",
      key: "note",
      render: (note) =>
        note?.length > 30 ? (
          <Tooltip title={note}>{note.substring(0, 30)}...</Tooltip>
        ) : (
          note
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status !== "rejected" && record.status !== "completed" ? (
          <Button
            btnCancel
            title={"Cancel"}
            size="large"
            onClick={() => openCancelModal(record)}
          />
        ) : null,
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentOfUser(paginationOptions);
      setPagination({
        currentPage: res.currentPage,
        totalPages: res.totalPages,
        totalItems: res.pagination.totalItems,
        limit: res.limit,
      });
      if (res.data === 0) {
        toast.info("No data available.");
      } else {
        setAppointmentData(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [paginationOptions]);

  // Fixed: Add paginationOptions to dependency array
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = useCallback(
    (pagination, filters, sorter) => {
      const newPaginationOptions = {
        ...paginationOptions,
        page: pagination.current,
        limit: pagination.pageSize,
      };

      setPaginationOptions(newPaginationOptions);
    },
    [paginationOptions]
  );

  const openCancelModal = (record) => {
    setSelectedData(record);
    setIsOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedData) return;

    try {
      setLoading(true);

      const res = await updateAppointmentStatus(selectedData._id, {
        status: "rejected",
      });

      if (res) {
        fetchData();
        toast.success("Appointment has been rejected");
      } else {
        toast.error(
          res?.message || "Failed to cancel appointment. Please try again."
        );
      }
    } catch (error) {
      toast.error(`Failed to cancel: ${error.message}`);
    } finally {
      setLoading(false);
      setIsOpen(false);
      setSelectedData(null);
    }
  };

  return (
    <div className="min-h-[500px]">
      <Table
        loading={loading}
        tableName="Appointment"
        columns={appointmentCol}
        data={appointmentData ?? []}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
      />
      <ConfirmModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onOk={handleCancel}
        title="Confirm Cancellation"
        content={"Are you sure you want to cancel this appointment?"}
      />
    </div>
  );
}

export default MyAppointment;
