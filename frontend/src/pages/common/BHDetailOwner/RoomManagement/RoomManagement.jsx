import { useState, useEffect } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { getRoomsByBoardingHouse } from "@/api/room";
import { Space } from "antd";
import covertTimetap from "@/utils/convertTimetap";
import convertTimetap from "@/utils/convertTimetap";
function RoomManagement({ boardingHouseId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  //fetch data
  const fetchRooms = async () => {
    const res = await getRoomsByBoardingHouse(boardingHouseId);
    if (res) {
      setRooms(res);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const columns = [
    {
      title: "Image",
      dataIndex: "roomImage",
      key: "roomImage",
      render: (image) => (
        <img
          src={image}
          alt="Room"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Tenants",
      dataIndex: "tenants",
      key: "tenants",
    },
    {
      title: "Availability",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (available) => (
        <span style={{ color: available ? "green" : "orange" }}>
          {available ? "Available" : "Occupied"}
        </span>
      ),
    },
    {
      title: "Room type",
      dataIndex: "roomTypeId",
      key: "roomTypeId",
      render: (roomType) => <span>{roomType?.typeName}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <>
          <Button btnDelete title={"Delete"} />
          <Button btnUpdate title={"Update"} />
        </>
      ),
    },
  ];

  return (
    <div>
      <Table data={rooms || []} columns={columns} loading={loading} />
    </div>
  );
}

export default RoomManagement;
