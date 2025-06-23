import { TableCustom as Table } from "@/component";
import { getRentPaymentByUserId } from "@/api/rentPaymentAPI";
import { useEffect, useState } from "react";
import { Tag } from "antd";
import RentPaymentDetailModal from "./RentPaymentDetailModal";

function MyRentPayment() {
  const [rentPayment, setRentPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchRentPayment = async () => {
    try {
      setLoading(true);
      const res = await getRentPaymentByUserId();
      setRentPayment(res);
    } catch (error) {
      console.error("Failed to fetch rent payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentPayment();
  }, []);

  const statusColors = {
    pending: "orange",
    paid: "green",
    overdue: "red",
    canceled: "gray",
  };

  const columns = [
    {
      title: "Boarding House",
      dataIndex: ["paymentBillId", "roomId", "boardingHouseId", "name"],
      key: "boardingHouse",
    },
    {
      title: "Room Number",
      dataIndex: ["paymentBillId", "roomId", "roomNumber"],
      key: "roomNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "blue"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Total Payment",
      dataIndex: "paymentAmount",
      key: "totalPayment",
      render: (text) => (
        <b style={{ color: "orange" }}>{text.toLocaleString()} VND</b>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Month's Rent",
      dataIndex: ["paymentBillId", "createdAt"],
      key: "createdAt",
      render: (text) => {
        const date = new Date(text);
        date.setMonth(date.getMonth());
        return date.toLocaleString("en-US", { month: "long", year: "numeric" });
      },
    },
  ];
  return (
    <>
      <Table
        columns={columns}
        data={rentPayment || []}
        loading={loading}
        rowKey={(record) => record?._id || Math.random()}
        onRowClick={(record) => setSelectedPayment(record)}
      />

      {selectedPayment && (
        <RentPaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}

export default MyRentPayment;
