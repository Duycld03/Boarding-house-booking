import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import formatAmount from "../../../utils/formatAmount";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "../../../component";
import { Tag } from "antd";
import { toast } from "react-toastify";
import { getRefundRequests } from "@/api/refundRequestManagement";

function MyDepositRefundRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refundRequests, setRefundRequests] = useState([]);

  const columns = [
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
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          {/* {record.status == "confirmed" && (
            <Button
              size="large"
              title={"Detail"}
              icon={<FileTextOutlined />}
              onClick={() => {
                setDepositRoomId(record._id);
                setIsPayRentModalVisible(true);
              }}
              className="text-white"
              bgColor="rgb(5 150 105)"
            />
          )}
          {record.status == "accepted" && (
            <Button
              size="large"
              title={"Pay"}
              icon={<DollarOutlined />}
              onClick={() => {
                // setDepositRoomId(record._id);
                setDepositRoom(record);
                setIsPayDepositPopupVisible(true);
              }}
              className="text-white"
              bgColor="rgb(5 150 105)"
            />
          )} */}
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

  return (
    <div className="">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Table loading={loading} columns={columns} data={refundRequests} />
        </>
      )}
    </div>
  );
}

export default MyDepositRefundRequest;
