import {
  getFacilities,
  updateFacility,
  deleteFacility,
  addFacility,
  filterFacilities,
} from "@/api/dashboard/facilitesManagement";
import { useState, useEffect } from "react";
import convertTimetap from "@/utils/convertTimetap";
import UpFacilities from "./UpdateFacilites";
import AddFacilities from "./AddFacilities";
import FilterFacilities from "./FilterFacilities";

import { Button, ConfirmModal, TableCustom } from "@/component";
import { toast } from "react-toastify";

function FacilitiesManagement() {
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState({ search: "" });

  const fetchFacilities = async () => {
    try {
      const res = await filterFacilities(filterValue);
      if (res.data) {
        setFacilitiesData(res.data);
        setFilteredData(res.data);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [filterValue]);

  const handleDelete = async () => {
    if (!selectedFacility) return;
    try {
      await deleteFacility(selectedFacility._id);
      toast.success("Delete facility successfully");
      await fetchFacilities();
    } catch (error) {
      toast.error("Delete facility failed");
      console.error("Error deleting facility:", error);
    } finally {
      setIsDeleteModalOpen(false);

      setSelectedFacility(null);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const update = await updateFacility(id, updatedData);
      if (update) {
        toast.success("Update facility successfully");
        await fetchFacilities();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Update facility failed";
      toast.error(`Update facility failed: ${errorMessage}`);
      console.error("Error updating facility:", error);
    } finally {
      setIsUpdateModalOpen(false);
    }
  };

  const handleOnAdd = async (newFacility) => {
    try {
      const res = await addFacility(newFacility);
      if (res) {
        toast.success("Facility added successfully");
        await fetchFacilities();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Add facility failed";
      toast.error(`Add facility failed: ${errorMessage}`);
      console.error("Error adding facility:", error);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center">
          <Button
            size="large"
            btnDelete
            title={"Delete"}
            onClick={() => {
              setSelectedFacility(record);
              setIsDeleteModalOpen(true);
            }}
          />
          <Button
            size="large"
            style={{ marginLeft: 8 }}
            btnUpdate
            title={"Update"}
            onClick={() => {
              setSelectedFacility(record);
              setIsUpdateModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  console.log(filterValue);

  return (
    <div>
      <div className="flex justify-between items-center">
        <AddFacilities onAddFacility={handleOnAdd} />
        <FilterFacilities setFilterValue={setFilterValue} />
      </div>
      <TableCustom columns={columns} data={filteredData} loading={loading} />
      <ConfirmModal
        title="Confirm Delete"
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
        content={`Are you sure you want to delete ${selectedFacility?.name}?`}
      />
      <UpFacilities
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        facility={selectedFacility}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default FacilitiesManagement;
