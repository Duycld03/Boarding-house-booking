import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tag, Tooltip, Modal } from "antd";
import {
  getAppointmentsByOwnerId,
  getAppointmentDetailForOwner,
  updateAppointmentStatus,
} from "../../../api/appointmentAPI";
import moment from "moment";
import AppointmentDetail from "./AppointmentDetails";
import { useCurrentUser } from "@/context/userContext";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/themeContext";
import { toast } from "react-toastify";

const ViewListAppointmentOwner = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { boardingHouseId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const { t } = useTranslation("appointment");
  const { darkMode } = useTheme();

  const { user } = useCurrentUser();
  const ownerId = user?._id;
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentsByOwnerId(
        ownerId,
        paginationOptions
      );

      if (response?.data) {
        const numberedAppointments = response.data.map((item, index) => ({
          ...item,
          number:
            (paginationOptions.page - 1) * paginationOptions.limit + index + 1,
        }));
        setAppointments(numberedAppointments);
        setPagination({
          current: response.pagination.currentPage,
          pageSize: response.pagination.limit,
          total: response.pagination.totalItems,
        });
      } else {
        // Khi không có dữ liệu, set về array rỗng và không hiện thông báo
        setAppointments([]);
        setPagination({
          current: 1,
          pageSize: 10,
          total: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách lịch hẹn.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPaginationOptions({
      ...paginationOptions,
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  useEffect(() => {
    if (ownerId) {
      fetchAppointments();
    } else {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin chủ trọ.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [ownerId, paginationOptions]);

  const fetchAppointmentDetail = async (appointmentId) => {
    try {
      const res = await getAppointmentDetailForOwner(appointmentId);

      console.log(res);

      const formattedAppointment = {
        _id: res._id,
        tenant: res.tenant ? { ...res.tenant } : {},
        room: res.room ? { ...res.room } : {},
        appointmentDate: res.appointmentDate
          ? moment(res.appointmentDate).format("YYYY-MM-DD HH:mm")
          : "no date",
        userNote: res.userNote || "No note",
        status: res.status || "unknown",
        reasonForCancel: res.reasonForCancel || null,
      };

      setAppointment(formattedAppointment);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Lỗi lấy thông tin chi tiết cuộc hẹn.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("API Error:", error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái thành công",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchAppointments(); // reload lại bảng
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Lỗi cập nhật trạng thái",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchAppointments(); // Gọi hàm
  }, [isModalOpen]);

  const columns = [
    {
      title: t("columns.name"),
      dataIndex: "boardingHouseName",
      key: "boardingHouseName",
    },
    {
      title: t("columns.customerName"),
      dataIndex: "tenantName",
      key: "tenantName",
    },
    {
      title: t("columns.roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: t("columns.date"),
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: t("columns.note"),
      dataIndex: "note",
      key: "note",
      render: (text) => (
        <Tooltip title={text}>
          {text && text.length > 50 ? `${text.slice(0, 50)}...` : text}
        </Tooltip>
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
              ? "green"
              : status === "rejected"
              ? "red"
              : "default"
          }
        >
          {t(`status.${status}`)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="min-h-[500px]">
      <Table
        tableName={t("columns.tableName")}
        columns={columns}
        data={appointments}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        onRowClick={(record) => fetchAppointmentDetail(record._id)}
      />
      <Modal
        title={
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {t("modal.title")}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="400px"
        style={{ top: 20 }}
        bodyStyle={darkMode ? { background: "#1f2937", color: "#f9fafb" } : {}}
      >
        {appointment ? (
          <AppointmentDetail
            appointment={appointment}
            onAcceptSuccess={() => {
              fetchAppointments();
              setIsModalOpen(false);
            }}
          />
        ) : (
          <p>{t("loading")}</p>
        )}
      </Modal>
    </div>
  );
};

export default ViewListAppointmentOwner;
