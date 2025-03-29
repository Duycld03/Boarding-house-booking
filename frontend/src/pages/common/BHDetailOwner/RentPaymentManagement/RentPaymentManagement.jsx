import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { toast } from "react-toastify";
import convertTimetap from "@/utils/convertTimetap";
import { Tag } from "antd";
import formatAmount from "@/utils/formatAmount";
import CalculateRent from "./CalculateRent";
import { getPaymentBillByBoardingHouseId } from "@/api/ownerUser/paymentBillManagement";

const RentPaymentManagement = () => {
  const { boardingHouseId } = useParams();
  const [rentPaymentData, setRentPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRentPaymentData = async () => {
    if (!boardingHouseId) return;
    setLoading(true);
    try {
      const res = await getPaymentBillByBoardingHouseId(boardingHouseId);
      setRentPaymentData(res);
    } catch (error) {
      console.log(error);
      setRentPaymentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentPaymentData();
  }, [boardingHouseId]);

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Monthly rent",
      dataIndex: "rentMonth",
      key: "rentMonth",
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
      title: "Additional Fee",
      dataIndex: "additionalFee",
      key: "additionalFee",
      render: (price) => (price ? formatAmount(price) : 0),
    },
    {
      title: "Electrical Bill",
      dataIndex: "electricalBill",
      key: "electricalBill",
      render: (price) => (price ? formatAmount(price) : "N/A"),
    },
    {
      title: "Water Bill",
      dataIndex: "waterBill",
      key: "waterBill",
      render: (price) => (price ? formatAmount(price) : "N/A"),
    },
    {
      title: "Payment Amount",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (price) => (price ? formatAmount(price) : "N/A"),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (record) => (
    //     <Button
    //       size="large"
    //       btnDelete
    //       title="Delete"
    //       onClick={() => {
    //         setSelectedTenant(record);
    //         setIsOpen(true);
    //       }}
    //     />
    //   ),
    // },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          btnAdd
          title="Calculate monthly"
          size="large"
          onClick={() => {
            setIsOpen(true);
          }}
        />
      </div>

      <Table
        columns={columns}
        data={rentPaymentData?.length > 0 ? rentPaymentData : []}
        loading={loading}
      />
      <CalculateRent
        visible={isOpen}
        setVisible={setIsOpen}
        boardingHouseId={boardingHouseId}
        fetchRentPaymentData={fetchRentPaymentData}
      />
    </div>
  );
};

export default RentPaymentManagement;
