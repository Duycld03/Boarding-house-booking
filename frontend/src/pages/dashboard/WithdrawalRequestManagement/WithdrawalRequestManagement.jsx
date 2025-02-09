import { useEffect, useState } from "react";
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  Loader,
} from "../../../component";
import { toast } from "react-toastify";
import { Tag } from "antd";
import { getWithdrawRequests } from "../../../api/withdrawalrequestmanagement";
import formatAmount from "../../../utils/formatAmount";

function WithdrawalRequestManagement() {
  const statusColors = {
    pending: "orange",
    processed: "green",
    cancelled: "red",
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "userId",
      key: "userId",
      render: (user) => user?.fullname || "N/A",
    },
    {
      title: "Amount / VND",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatAmount(amount) + " VND",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status.toLowerCase()]}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Processed By",
      dataIndex: "processedBy",
      key: "processedBy",
      render: (processedBy) => processedBy?.fullname || "N/A",
    },
    {
      title: "Action",
      render: (record) => (
        <>
          <Button
            title={"Delete"}
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
          ></Button>
        </>
      ),
    },
  ];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenStatusChangeModal, setIsOpenStatusChangeModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchData = async () => {
    try {
      const res = await getWithdrawRequests();
      if (res) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      toast.error(
        "Failed to fetch withdrawal requests. Please try again later."
      );
      setData([]);
    }
  };

  const handleStatusChangeModal = (record) => {
    setSelectedRequest(record);
    setIsOpenStatusChangeModal(true);
  };

  const handleStatusChange = () => {
    // Handle API call to update status
    console.log(
      `Updated status for request ${selectedRequest._id}: ${newStatus}`
    );
    setIsOpenStatusChangeModal(false);
    setSelectedRequest(null);
    setNewStatus("");
    toast.success("Status updated successfully.");
    fetchData();
  };

  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  const handleDelete = () => {
    // Handle API call to delete request
    console.log("Delete request confirmed");
    setIsOpenDeleteModal(false);
    setSelectedRequest(null);
    toast.success("Withdrawal request deleted successfully.");
    fetchData();
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });
  }, []);
  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Button
              size="large"
              onClick={() => toast.success("Add success")}
              btnAdd
              title={"Add new"}
            ></Button>
            <Button
              btnFilter
              size="large"
              onClick={() => toast.success("Filter success")}
              title={"Filter"}
            ></Button>
          </div>
          <div>
            <Table columns={columns} data={data || []} loading={loading} />
          </div>
          <ConfirmModal
            title="Confirm Status Change"
            content={`Do you want to change the status to ${newStatus}?`}
            onOk={handleStatusChange}
            onCancel={() => setIsOpenStatusChangeModal(false)}
            isOpen={isOpenStatusChangeModal}
          >
            <input
              type="text"
              placeholder="Enter new status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
          </ConfirmModal>
          <ConfirmModal
            title="Confirm Deletion"
            content="Do you want to delete this withdrawal request?"
            onOk={handleDelete}
            onCancel={() => setIsOpenDeleteModal(false)}
            isOpen={isOpenDeleteModal}
          />
        </>
      )}
    </div>
  );
}

export default WithdrawalRequestManagement;
