import { useEffect, useState } from "react";
import {
  getAppointmentOfUser,
  updateAppointmentStatus,
} from "../../../api/appointment";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import convertTimetap from "../../../utils/convertTimetap";
import { message, Tag, Tooltip } from "antd";

function MyAppointment() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const statusColors = {
    pending: "blue",
    confirmed: "orange",
    canceled: "red",
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
        record.status !== "canceled" && record.status !== "completed" ? (
          <Button
            btnCancel
            title={"Cancel"}
            size="large"
            onClick={() => openCancelModal(record)}
          />
        ) : null,
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAppointmentOfUser();
      if (res.length === 0) {
        toast.info("No data available.");
      } else {
        setAppointmentData(res);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCancelModal = (record) => {
    setSelectedData(record);
    setIsOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedData) return;

    try {
      setLoading(true);

      const res = await updateAppointmentStatus(selectedData._id, {
        status: "canceled",
      });

      if (res) {
        fetchData();
        toast.success("Appointment has been canceled");
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
        columns={appointmentCol}
        data={appointmentData ?? []}
      />
      <ConfirmModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onOk={handleCancel}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this appointment?"
      />
    </div>
  );
}

export default MyAppointment;
