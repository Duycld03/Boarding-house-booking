import { useState, useEffect } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { getRoomsByBoardingHouse } from "@/api/roomAPI";
import { Image, Space } from "antd";
import convertTimetap from "@/utils/convertTimetap";
import AddRoom from "./AddRoom";
import { toast } from "react-toastify";
import { deleteRoom } from "@/api/ownerUser/boardingHouseAPI";
import UpdateRoom from "./UpdateRoom";

function RoomManagement({ boardingHouseId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectRoomId, setSelectRoomId] = useState(null);
  const [selectRoomData, setSelectRoomData] = useState(null);
  const [visibleUpdateRoom, setVisibleUpdateRoom] = useState(false);

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
      dataIndex: "images",
      key: "images",
      render: (image) => (
        <Image
          src={image?.imageUrl}
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
      dataIndex: "rentBy",
      key: "tenants",
      render: (tenants) => (
        <span>{tenants.map((tenant) => tenant.fullname).join(", ")}</span>
      ),
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
        <div className="flex gap-3">
          <Button
            btnDelete
            title="Delete"
            size="large"
            onClick={() => {
              setIsOpenDeleteModal(true);
              setSelectRoomId(record._id);
            }}
          />
          <Button
            btnUpdate
            title="Update"
            size="large"
            onClick={() => {
              setSelectRoomData(record);
              setVisibleUpdateRoom(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteRoom(selectRoomId);
      fetchRooms();
      toast.success(res.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      setIsOpenDeleteModal(false);
    }
  };

  return (
    <div>
      <AddRoom boardingHouseId={boardingHouseId} refreshRoomData={fetchRooms} />
      <Table data={rooms || []} columns={columns} loading={loading} />
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete this room?`}
        onOk={handleDelete}
        onCancel={() => {
          setIsOpenDeleteModal(false);
        }}
        isOpen={isOpenDeleteModal}
      />
      <UpdateRoom
        visible={visibleUpdateRoom}
        setVisible={setVisibleUpdateRoom}
        boardingHouseId={boardingHouseId}
        refreshRoomData={fetchRooms}
        roomData={selectRoomData}
      />
    </div>
  );
}

export default RoomManagement;
