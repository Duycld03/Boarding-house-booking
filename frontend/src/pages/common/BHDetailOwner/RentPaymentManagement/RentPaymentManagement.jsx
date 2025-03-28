import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import {
  getTenantsByBoardingHouse,
  deleteTenantFromBoardingHouse,
} from "@/api/tenantManagement";
import { toast } from "react-toastify";
import convertTimetap from "@/utils/convertTimetap";
import { Avatar, Tag } from "antd";
import DefaultAvatar from "@/assets/images/none_avatar.png";
import formatAmount from "@/utils/formatAmount";
import CalculateRent from "./CalculateRent";

const RentPaymentManagement = () => {
  const { boardingHouseId } = useParams();
  const [tenantData, setTenantData] = useState([]);
  const [rentPaymentData, setRentPaymentData] = useState([
    {
      roomNumber: "101",
      monthlyRent: 2,
      status: "pending",
      additionalFee: 50000,
      electricalBill: 20000,
      waterBill: 10000,
      paymentAmount: 80000,
    },
    // Thêm các dữ liệu khác nếu cần
  ]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      setLoading(true);
      try {
        const data = await getTenantsByBoardingHouse(boardingHouseId);
        console.log(data);

        setTenantData(data);
      } catch (error) {
        // toast.error('Failed to fetch tenant data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [boardingHouseId]);

  const handleDelete = async () => {
    if (!selectedTenant || !selectedTenant.accountId) {
      toast.error("Error: Missing tenant accountId.");
      return;
    }

    setLoading(true);
    try {
      await deleteTenantFromBoardingHouse(
        boardingHouseId,
        selectedTenant.accountId
      );

      // Gọi lại API để cập nhật danh sách mới nhất
      const updatedData = await getTenantsByBoardingHouse(boardingHouseId);
      setTenantData(updatedData);

      toast.success("Tenant deleted successfully.");
    } catch (error) {
      console.error(
        "🔥 Delete Tenant Error:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to delete tenant: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Monthly rent",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
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
      render: (price) => (price ? formatAmount(price) : "N/A"),
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
        <Button btnAdd title="Calculate monthly" size="large" />
      </div>

      <Table columns={columns} data={rentPaymentData} loading={loading} />
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this tenant?"
        isOpen={isOpen}
        onOk={handleDelete}
        onCancel={() => setIsOpen(false)}
      />
      <CalculateRent visible={true} setVisible={() => {}} />
    </div>
  );
};

export default RentPaymentManagement;
