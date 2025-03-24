import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { FileTextOutlined } from "@ant-design/icons";
import formatAmount from "../../../utils/formatAmount";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyDepositedRoom } from "@/api/depositManagement";
import { Loader } from "../../../component";
import { Tag } from "antd";
import MyDepositDetail from "./MyDepositDetail";
import { toast } from "react-toastify";
import ActionDropdown from "./ActionDropdown";
import RenewalRequestForm from "./RenewalRequestForm";
import { getExtensionRequests } from "@/api/extensionRequest";

function MyDepositedRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [depositRoomId, setDepositRoomId] = useState("");

  //Renewal Request Form
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);

  const fetchExtensionRequests = async () => {
    try {
      const response = await getExtensionRequests();
      setExistingRequest(response);
    } catch (error) {
      console.error("API error:", error);
    }
  };

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
        <ActionDropdown
          record={record}
          onDetailClick={(id) => {
            setDepositRoomId(id);
            setIsModalVisible(true);
          }}
          onRenewalClick={(record) => {
            setSelectedRecord(record);
            setIsRenewalOpen(true);
          }}
        />
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
    fetchExtensionRequests();
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
      {selectedRecord && (
        <RenewalRequestForm
          visible={isRenewalOpen}
          onClose={() => setIsRenewalOpen(false)}
          mode="tenant"
          existingRequest={existingRequest}
          renewalData={selectedRecord}
        />
      )}
    </div>
  );
}

export default MyDepositedRoom;
