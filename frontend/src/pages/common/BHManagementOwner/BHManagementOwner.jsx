import React, { useEffect, useState } from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import { Tooltip } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllBHOwner,
  updateBoardingHouseDetailsOwner,
  softDeleteBoardingHouseOwner,
} from "../../../api/BoardingHManagement";
import formatAmount from "../../../utils/formatAmount";
import AddBHModal from "./AddBH";
// import UpdateBHModal from "./UpdateBH";

function BHManagementOwner() {
  const [boardingHouses, setBoardingHouses] = useState([]); // List of boarding houses
  const [loading, setLoading] = useState(false); // Loading state for data fetching
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false); // Delete confirmation modal state
  const [isEditOpen, setIsEditOpen] = useState(false); // Edit modal state
  const [selectedData, setSelectedData] = useState(null); // Data of the selected boarding house
  const navigate = useNavigate();

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address) =>
        address ? (
          <Tooltip
            title={`${address.detail}, ${address.ward}, ${address.district}, ${address.province}`}
          >
            {`${address.detail}, ${address.ward}, ${address.district}`}
          </Tooltip>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Price Range (VND)",
      dataIndex: "priceRange",
      key: "priceRange",
      render: (price) => (price ? formatAmount(price) : "N/A"),
    },
    {
      title: "Boarding House Type",
      dataIndex: "boardingHouseType",
      key: "boardingHouseType",
      render: (type) => type?.name || "N/A",
    },
    { title: "Total Rooms", dataIndex: "totalRooms", key: "totalRooms" },
    {
      title: "Available Rooms",
      dataIndex: "availableRooms",
      key: "availableRooms",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            btnDelete
            title={"Delete"}
            onClick={() => handleOpenDeleteModal(record)}
          />
          <Button
            size="large"
            title={"Detail"}
            icon={<FileTextOutlined />}
            // onClick={() => openEditModal(record)}
            onClick={() => navigate(`/bh-management-owner/${record._id}`)}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];

  // Fetch all boarding houses
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBHOwner();
      if (res && Array.isArray(res)) {
        setBoardingHouses(res);
      } else {
        toast.error("Failed to fetch boarding houses.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  // Open Edit Modal
  const openEditModal = (record) => {
    setSelectedData(record); // Set selected boarding house
    setIsEditOpen(true); // Open edit modal
  };

  // Handle Add New Data
  const handleAddNewData = async () => {
    await fetchData(); // Refresh data after adding a new boarding house
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (record) => {
    setSelectedData(record); // Set selected boarding house for deletion
    setIsOpenDeleteModal(true); // Open delete confirmation modal
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedData || !selectedData._id) return; // Ensure valid data
    try {
      setLoading(true);
      await softDeleteBoardingHouseOwner(selectedData._id); // Call delete API
      toast.success("Boarding house deleted successfully.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting boarding house:", error);
      toast.error("Failed to delete boarding house.");
    } finally {
      setLoading(false);
      setIsOpenDeleteModal(false); // Close delete modal
      setSelectedData(null); // Clear selected data
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    fetchData(); // Refresh data after updating
    setIsEditOpen(false); // Close edit modal
  };

  return (
    <div>
      {/* Add New Boarding House */}
      <div className="flex justify-between mb-4">
        <AddBHModal onAddData={handleAddNewData} />
      </div>

      {/* Boarding House Table */}
      <Table loading={loading} columns={columns} data={boardingHouses ?? []} />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete this boarding house?`}
        onOk={handleDelete} // Trigger delete action
        onCancel={() => {
          setIsOpenDeleteModal(false); // Close modal
          setSelectedData(null); // Clear selected data
        }}
        isOpen={isOpenDeleteModal}
      />

      {/* Edit Modal */}
      {/* <UpdateBHModal
        open={isEditOpen}
        formData={selectedData}
        onCancel={() => setIsEditOpen(false)}
        onUpdate={handleUpdate}
      /> */}
    </div>
  );
}

export default BHManagementOwner;
