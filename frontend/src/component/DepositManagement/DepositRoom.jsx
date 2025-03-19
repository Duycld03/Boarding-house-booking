import React, { useState, useEffect } from "react";
import { Tag } from "antd";

import { toast } from "react-toastify";
import { getDepositByBhId } from "../../api/depositManagement";
import { useParams } from "react-router-dom";
import Table from "@/component/Table";
import formatAmount from "@/utils/formatAmount";
import FilterDeposit from "./FilterDeposite";
import { getRoomsByBoardingHouse } from "@/api/room";

const DepositRoom = () => {
  const [depositedRooms, setDepositedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { boardingHouseId } = useParams();
  const [listRoom, setListRoom] = useState([]);

  const [filterValue, setFilterValue] = useState({});

  const getRoomsByBoardingHouseId = async () => {
    try {
      const response = await getRoomsByBoardingHouse(boardingHouseId);
      setListRoom(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
      setListRoom([]);
    }
  };

  const fetchDepositedRooms = async () => {
    try {
      const response = await getDepositByBhId(boardingHouseId, filterValue);

      setDepositedRooms(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching deposit rooms:", error);
      toast.error("Failed to fetch deposit rooms");
      setDepositedRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardingHouseId) {
      fetchDepositedRooms();
    }
  }, [filterValue]);

  useEffect(() => {
    getRoomsByBoardingHouseId();
  }, []);

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
              : status === "deleted"
              ? "volcano"
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
      //   render: (_, record) => (
      //     <Button
      //       disabled={record.status === 'pending'}
      //       size="large"
      //       title="Detail"
      //       icon={<FileTextOutlined />}
      //       onClick={() => {
      //         setDepositRoomId(record._id);
      //         setIsModalVisible(true);
      //       }}
      //       className="text-white"
      //       style={{ backgroundColor: 'rgb(5 150 105)', color: 'white' }}
      //     />
      //   ),
    },
  ];

  return (
    <div className="min-h-screen ">
      <div className="flex justify-end">
        <FilterDeposit setFilterValue={(setFilterValue, listRoom)} />
      </div>
      <Table columns={columns} data={depositedRooms || []} loading={loading} />
    </div>
  );
};

export default DepositRoom;
