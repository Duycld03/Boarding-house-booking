import { Card, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import { Tooltip } from "antd";
import { getAllBHOwner } from "@/api/BoardingHManagement";

import { FileTextOutlined } from "@ant-design/icons";
import formatAmount from "../../../utils/formatAmount";
import { useNavigate } from "react-router-dom";
import { render } from "react-dom";
import { getMyDepositedRoom } from "@/api/depositManagement";

function MyDepositedRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [depositedRooms, setDepositedRooms] = useState([]);

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
          {/* <Button
            size="large"
            btnDelete
            title={"Delete"}
            onClick={() => handleOpenDeleteModal(record)}
          /> */}
          <Button
            size="large"
            title={"Detail"}
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/my-deposited-room/${record._id}`)}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
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
    fetchData();
  }, []);

  return (
    <div>
      <Table loading={loading} columns={columns} data={depositedRooms} />
    </div>
  );
}

export default MyDepositedRoom;
