import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import {
  getTenantsByBoardingHouse,
  deleteTenantFromBoardingHouse,
} from "@/api/tenantManagement";
import { toast } from "react-toastify";
import convertTimetap from "@/utils/convertTimetap";
import { Avatar } from "antd";
import DefaultAvatar from "@/assets/images/none_avatar.png";

const TenantManagement = () => {
  const { boardingHouseId } = useParams();
  const [tenantData, setTenantData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      setLoading(true);
      try {
        const data = await getTenantsByBoardingHouse(boardingHouseId);

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
      title: "Avatar",
      dataIndex: "avatarImage",
      key: "avatarImage",
      render: (avatarImage) => {
        return (
          <Avatar
            src={avatarImage?.url ?? DefaultAvatar}
            shape="circle"
            size="large"
          />
        );
      },
    },
    {
      title: "Tenant Name",
      dataIndex: "tenantName",
      key: "tenantName",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Button
          size="large"
          btnDelete
          title="Delete"
          onClick={() => {
            setSelectedTenant(record);
            setIsOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Table columns={columns} data={tenantData} loading={loading} />
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this tenant?"
        isOpen={isOpen}
        onOk={handleDelete}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

export default TenantManagement;
