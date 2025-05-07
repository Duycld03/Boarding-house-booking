import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import formatAmount from "../../../utils/formatAmount";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "../../../component";
import { Tag } from "antd";
import { toast } from "react-toastify";
import {
  getRefundRequests,
  cancelRefundRequestsForOwner,
} from "@/api/ownerUser/refundRequestManagement";
import { Input, Modal } from "antd";
import { Form } from "antd"; // Import Form component
import DepositRefundPopup from "./DepositRefundPopup";

function DepositRefundRequestOwner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refundRequests, setRefundRequests] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // Trạng thái modal reject
  const [reasonForCancel, setReasonForCancel] = useState(""); // Lý do hủy
  const [selectedRefundRequest, setSelectedRefundRequest] = useState(null); // Lưu refundRequest được chọn
  const [isDepositRefundPopupOpen, setIsDepositRefundPopupOpen] =
    useState(false);

  const columns = [
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
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Amount Refunded",
      dataIndex: "amountRefunded",
      key: "amountRefunded",
      render: (price) => (price ? formatAmount(price) : "N/A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "accepted"
              ? "green"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Action",
      render: (record) =>
        record.status === "pending" && (
          <div className="flex gap-3 items-center">
            <Button
              title={"Accept"}
              iconPosition="left"
              btnAccept
              size="large"
              onClick={() => handleAccept(record)}
            ></Button>
            <Button
              title={"Cancel"}
              iconPosition="left"
              btnReject
              size="large"
              onClick={() => handleReject(record)} // Mở modal khi nhấn "Cancel"
            ></Button>
          </div>
        ),
    },
  ];

  const fetchData = async () => {
    try {
      const res = await getRefundRequests();
      setRefundRequests(res);
    } catch (error) {
      console.log("Error getting deposited room:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status === "success") {
      toast.success("Pay successfully!");
    } else if (status === "fail") {
      toast.error("Pay failed!");
    }
    params.delete("status");
    if (status) {
      navigate(window.location.pathname, { replace: true });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleReject = (refundRequest) => {
    setSelectedRefundRequest(refundRequest); // Lưu thông tin yêu cầu hoàn tiền được chọn
    setIsRejectModalOpen(true); // Mở modal
  };

  const handleAccept = (refundRequest) => {
    setSelectedRefundRequest(refundRequest);
    setIsDepositRefundPopupOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!reasonForCancel) {
      toast.error("Please provide a reason for canceling the request.");
      return;
    }

    try {
      // Gọi API để hủy yêu cầu hoàn tiền
      await cancelRefundRequestsForOwner(
        selectedRefundRequest._id,
        reasonForCancel
      );
      toast.success("Refund request canceled successfully!");
      // Đóng modal và làm mới dữ liệu
      setIsRejectModalOpen(false);
      setReasonForCancel("");
      fetchData(); // Tải lại danh sách yêu cầu hoàn tiền
    } catch (error) {
      toast.error("Error canceling the refund request.");
      console.log("Error canceling refund request:", error);
    }
  };

  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false); // Đóng modal khi người dùng hủy
    setReasonForCancel("");
  };

  return (
    <div className="">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Table loading={loading} columns={columns} data={refundRequests} />
          <Modal
            title="Reject Refund Request"
            visible={isRejectModalOpen}
            onOk={handleRejectConfirm}
            onCancel={handleCancelRejectModal}
            okText="Reject"
            width="400px"
          >
            <Form layout="vertical">
              <Form.Item
                label="Reason For Cancel"
                name="reasonForCancel"
                rules={[
                  {
                    required: true,
                    message: "Please enter a reason for rejection",
                  },
                ]} // Kiểm tra lý do
              >
                <Input.TextArea
                  type="text"
                  placeholder="Enter reason for rejection"
                  value={reasonForCancel}
                  onChange={(e) => setReasonForCancel(e.target.value)}
                  style={{ width: "100%", height: "100px" }} // Đảm bảo input chiếm đầy chiều rộng
                />
              </Form.Item>
            </Form>
          </Modal>
          <DepositRefundPopup
            visible={isDepositRefundPopupOpen}
            setVisible={setIsDepositRefundPopupOpen}
            depositRefundData={selectedRefundRequest}
          />
        </>
      )}
    </div>
  );
}

export default DepositRefundRequestOwner;
