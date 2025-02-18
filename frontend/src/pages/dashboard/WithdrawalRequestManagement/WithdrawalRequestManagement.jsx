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
  filterWithdrawRequests,
  getWithdrawRequests,
} from "../../../api/withdrawalrequestmanagement";
import formatAmount from "../../../utils/formatAmount";
import Detail from "./WithdrawalRequestsDetails";
import { FileTextOutlined } from "@ant-design/icons";
import FilterWithdrawal from "./FilterWithdrawal";
import convertTimetap from "../../../utils/convertTimetap";

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
      render: (user) => user?.fullname || "",
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
      render: (processedBy) => processedBy?.fullname || "",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => convertTimetap(createdAt),
    },
    {
      title: "Action",
      render: (record) => (
        <>
          <div className="flex gap-3 items-center">
            <Button
              title={"Delete"}
              size="large"
              btnDelete
              className="btn-delete"
              onClick={() => handleDeleteModal(record)}
            ></Button>
            <Button
              title={"Detail"}
              size="large"
              onClick={() => handleDetail(record)}
              icon={<FileTextOutlined />}
              className="text-white"
              bgColor="rgb(5 150 105)"
            />
          </div>
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();

  const fetchData = async () => {
    setLoading(true);
    try {
      const dataDefault = {
        status: "",
        startDate: "",
        endDate: "",
        amountRange: [0],
      };
      const res = await filterWithdrawRequests(dataDefault);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchFilter = async () => {
    try {
      const res = await filterWithdrawRequests(filterValue);
      setData(res);
    } catch (error) {
      toast.error("Failed to fetch filtered accounts. Please try again later.");
      setData([]);
    } finally {
    }
  };

  const handleDetail = (record) => {
    setSelectedRequest(record._id);
    setIsDetailOpen(true);
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
    fetchData();
  }, []);

  useEffect(() => {
    if (filterValue) {
      fetchFilter();
    }
  }, [filterValue]);

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <FilterWithdrawal setFilterValue={setFilterValue} />
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
          {isDetailOpen && selectedRequest && (
            <Detail
              requestId={selectedRequest}
              onClose={() => setIsDetailOpen(false)}
              onStatusUpdate={fetchData}
            />
          )}
        </>
      )}
    </div>
  );
}

export default WithdrawalRequestManagement;
