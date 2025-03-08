import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { FileTextOutlined } from "@ant-design/icons";
import formatAmount from "../../../utils/formatAmount";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyDepositedRoom } from "@/api/depositManagement";
import { Loader } from "../../../component";
import { Tag, Modal } from "antd";
import MyDepositDetail from "./MyDepositDetail";
import { toast } from "react-toastify";

function MyDepositedRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [depositRoomId, setDepositRoomId] = useState("");

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
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
      title: "Rental Time",
      dataIndex: "rentalTime",
      key: "rentalTime",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            disabled={record.status == "pending"}
            size="large"
            title={"Detail"}
            icon={<FileTextOutlined />}
            // onClick={() => navigate(`/my-deposited-room/${record._id}`)}
            onClick={() => {
              setDepositRoomId(record._id);
              setIsModalVisible(true);
            }}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];
  const fetchData = async () => {
    try {
      const res = await getMyDepositedRoom();
      setDepositedRooms(res);
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
      toast.success("Pay rent successfully!");
    } else if (status === "fail") {
      toast.error("Pay rent failed!");
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
          <Table loading={loading} columns={columns} data={depositedRooms} />
          <MyDepositDetail
            depositRoomId={depositRoomId}
            isModalVisible={isModalVisible}
            handleCancel={handleCancel}
          />
        </>
      )}
    </div>
  );
}

export default MyDepositedRoom;
