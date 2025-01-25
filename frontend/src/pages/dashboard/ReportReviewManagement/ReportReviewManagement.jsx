import { useEffect, useState } from "react";
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  Loader,
} from "../../../component";
import { toast } from "react-toastify";
import { Tag } from "antd";
import {
  getReviewReports,
  updateReportStatus,
} from "../../../api/reportManagement";
import convertTimetap from "../../../utils/convertTimetap";

function ReportReviewManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState("");

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReviewReports();
      setData(res || []);
    } catch (error) {
      console.error("Failed to fetch review reports:", error);
      toast.error("Failed to fetch review reports. Please try again later.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusColors = {
    resolved: "green",
    rejected: "red",
  };

  const handleOpenConfirmModal = (record, type) => {
    setSelectedRequest(record);
    setActionType(type);
    setIsOpenConfirmModal(true);
  };
  // Fetch data from the API
  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    try {
      await updateReportStatus(selectedRequest._id, actionType);
      setData(
        data.map((item) =>
          item._id === selectedRequest._id
            ? { ...item, status: actionType }
            : item
        )
      );
      toast.success(
        actionType === "rejected"
          ? "Report rejected successfully!"
          : "Report processed successfully!"
      );
    } catch (error) {
      console.error("Failed to update report status:", error);
      toast.error("Failed to update report status. Please try again later.");
    } finally {
      setIsOpenConfirmModal(false);
      setSelectedRequest(null);
      setActionType("");
    }
  };

  const columns = [
    {
      title: "Reporter",
      dataIndex: "reporter",
      key: "reporter",
      render: (reporter) => reporter?.fullname || "N/A",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status.toLowerCase()]}>{status}</Tag>
      ),
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => {
        // Format the timestamp or return "Invalid date" if formatting fails
        try {
          return convertTimetap(createdAt);
        } catch (error) {
          console.error("Error formatting createdAt:", error);
          return "Invalid date";
        }
      },
    },
    {
      title: "Processed by",
      dataIndex: "processedBy",
      key: "processedBy",
      render: (processedBy) => processedBy?.fullname || "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <div className="flex space-x-4">
          <Button
            btnDelete
            title="Reject"
            size="medium"
            className="px-4 py-2 text-base"
            onClick={() => handleOpenConfirmModal(record, "rejected")}
          />
          <Button
            btnRestore
            title="Process"
            size="medium"
            className="px-4 py-2 text-base"
            onClick={() => handleOpenConfirmModal(record, "resolved")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Button
              btnFilter
              title="Filter"
              size="medium"
              className="px-4 py-2 text-base"
              onClick={() => toast.success("Filter success")}
            />
          </div>
          <Table columns={columns} data={data} />
          <ConfirmModal
            title="Confirm Action"
            content={`Are you sure you want to ${actionType === "rejected" ? "reject" : "process"
              } this report?`}
            isOpen={isOpenConfirmModal}
            onOk={handleConfirmAction}
            onCancel={() => setIsOpenConfirmModal(false)}
          />
        </>
      )}
    </div>
  );
}

export default ReportReviewManagement;