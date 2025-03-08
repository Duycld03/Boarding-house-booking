import React, { useEffect, useState, useMemo } from "react";
import { Modal, Card, Image, List, Avatar, Dropdown, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { checkPayRentStatus, getDepositRoom } from "@/api/depositManagement";
import formatAmount from "@/utils/formatAmount";
import { useCurrentUser } from "@/context/userContext";
import PayRentPopup from "./PayRentPopup";

function MyDepositDetail({ depositRoomId, isModalVisible, handleCancel }) {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [depositRoom, setDepositRoom] = useState({});
  const [payRentVisible, setPayRentVisible] = useState(false);
  const [payRentData, setPayRentData] = useState({});
  const [isPaid, setIsPaid] = useState(false);

  const fetchDepositRoom = async () => {
    if (!depositRoomId) return;
    setLoading(true);
    try {
      const res = await getDepositRoom(depositRoomId);
      res.primaryImage = res.images.find((image) => image.isPrimary);
      setDepositRoom(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayRentStatus = async () => {
    if (!depositRoomId) return;
    setLoading(true);
    try {
      const res = await checkPayRentStatus(depositRoomId);
      setIsPaid(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositRoom();
    fetchPayRentStatus();
  }, [depositRoomId]);

  const payRent = async (userId) => {
    setPayRentData({ userId, depositRoomId });
    setPayRentVisible(true);
  };

  const refundDeposit = async (userId) => {
    console.log("Refund deposit for", userId, "in room", depositRoomId);
  };

  const extendRent = async (userId) => {
    console.log("Extend rent for", userId, "in room", depositRoomId);
  };

  const report = async (userId) => {
    console.log("Report", userId, "in room", depositRoomId);
  };

  const getDropdownItems = (rentUser) => {
    return rentUser._id === user._id
      ? [
          {
            key: "pay_rent",
            label: "Pay Rent",
            onClick: () => payRent(rentUser._id),
            disabled: isPaid,
          },
          {
            key: "refund_deposit",
            label: "Refund Deposit",
            onClick: () => refundDeposit(rentUser._id),
          },
          {
            key: "extend_rent",
            label: "Extend Rent",
            onClick: () => extendRent(rentUser._id),
          },
        ]
      : [
          {
            key: "report",
            label: "Report",
            onClick: () => report(rentUser._id),
          },
        ];
  };

  return (
    <>
      <Modal
        loading={loading}
        open={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <div className="mb-4">
          <Image src={depositRoom?.primaryImage?.imageUrl} />
        </div>
        <p className="text-3xl font-bold mb-2">
          {depositRoom.boardingHouseName}
        </p>
        <p className="text-2xl mb-2">Room Number: {depositRoom.roomNumber}</p>
        <p className="text-2xl mb-2">
          Room Type: {depositRoom.boardingHouseType}
        </p>
        <p className="text-2xl mb-2">
          Room Size: {depositRoom.roomSize} m<sup>2</sup>
        </p>
        <p className="text-2xl mb-2">
          Price: {formatAmount(depositRoom.price)} VND/Month
        </p>
        <List
          dataSource={depositRoom.rentBy}
          header={<div className="text-2xl font-bold">Rent By</div>}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Dropdown
                  menu={{ items: getDropdownItems(item) }}
                  trigger={["click"]}
                >
                  <EllipsisOutlined
                    style={{ fontSize: "24px", cursor: "pointer" }}
                  />
                </Dropdown>,
              ]}
            >
              <List.Item.Meta
                className="flex items-center"
                avatar={<Avatar src={item?.avatarImage.url} />}
                title={item?.fullname}
              />
            </List.Item>
          )}
        />
      </Modal>
      <PayRentPopup
        isVisible={payRentVisible}
        setVisible={setPayRentVisible}
        payRentData={payRentData}
      />
    </>
  );
}

export default MyDepositDetail;
