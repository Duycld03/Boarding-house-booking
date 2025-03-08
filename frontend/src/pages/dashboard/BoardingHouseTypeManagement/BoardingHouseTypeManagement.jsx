import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, ConfirmModal } from "../../../component";
import Table from "../../../component/Table";

import {
    getAllBoardingHouseTypes,
    createBoardingHouseType,
    softDeleteBoardingHouseType,
    filterBoardingHouseTypes,
} from "../../../api/BoardingHManagement";
import CreateBoardingHouseType from "./CreateBoardingHouseType";
import UpdateBoardingHouseType from "./UpdateBoardingHouseType";
import FilterBoardingHouseType from "./FilterBoardingHouseType";
import { FileTextOutlined } from "@ant-design/icons";

function BoardingHouseTypeManagement() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterValue, setFilterValue] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAllBoardingHouseTypes();
            if (response && response.data) {
                const formattedData = response.data.map((item) => ({
                    id: item.value,
                    name: item.label,
                    description: item.description,
                    createdAt: item.createdAt || null,
                    updatedAt: item.updatedAt || null,
                }));
                setData(formattedData);
            } else {
                setData([]);
            }
        } catch (error) {
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async (filters) => {
        setLoading(true);
        try {
            const response = await filterBoardingHouseTypes(filters);
            if (response && response.success && Array.isArray(response.data)) {
                if (response.data.length === 0) {
                    toast.warn("No results found for the current filter.");
                }
                const formattedData = response.data.map((item) => ({
                    id: item.value || item._id,
                    name: item.name || item.label,
                    createdAt: item.createdAt || null,
                    updatedAt: item.updatedAt || null,
                }));
                setData(formattedData);
            } else {
                setData([]);
            }
        } catch (error) {
            // toast.error(
            //     error.response?.data?.message ||
            //     "Failed to filter boarding house types. Please try again."
            // );
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filterValue && (filterValue.name || filterValue.startDate || filterValue.endDate)) {
            fetchFilterData(filterValue);
        } else {
            fetchData();
        }
    }, [filterValue]);

    const handleAddNew = async (values) => {
        try {
            await createBoardingHouseType(values);
            toast.success("Added new boarding house type successfully!");
            setIsCreateModalVisible(false);
            fetchData();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "An unexpected error occurred."
            );
        }
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalVisible(true);
    };

    const handleOpenUpdateModal = (record) => {
        setEditingRecordId(record.id);
        setIsUpdateModalVisible(true);
    };

    const handleDeleteModal = (record) => {
        setSelectedRequest(record);
        setIsOpenDeleteModal(true);
    };

    const handleSelectDelete = async () => {
        if (!selectedRequest) {
            toast.error("No boarding house type selected for deletion.");
            return;
        }

        try {
            const response = await softDeleteBoardingHouseType(selectedRequest.id);
            if (response.success) {
                toast.success("Boarding house type soft deleted successfully.");
                fetchData();
                setIsOpenDeleteModal(false);
                setSelectedRequest(null);
            } else {
                toast.error(response.message || "Failed to soft delete boarding house type.");
            }
        } catch (error) {
            toast.error("Failed to soft delete boarding house type. Please try again later.");
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) =>
                text ? new Date(text).toLocaleDateString("en-GB") : "N/A",
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (text) =>
                text ? new Date(text).toLocaleDateString("en-GB") : "N/A",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <div className="flex gap-3">
                    <Button
                        title="Delete"
                        size="large"
                        btnDelete
                        onClick={() => handleDeleteModal(record)}
                    />
                    <Button
                        size="large"
                        style={{ marginLeft: 8 }}
                        btnUpdate
                        title={"Update"}
                        onClick={() => handleOpenUpdateModal(record)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <div className="flex justify-between">
                <Button
                    btnAdd
                    title="Add new"
                    size="large"
                    onClick={handleOpenCreateModal}
                />
                <FilterBoardingHouseType setFilterValue={setFilterValue} />
            </div>
            <div>
                <Table columns={columns} data={data} loading={loading} />
            </div>
            <ConfirmModal
                title="Confirm Deletion"
                content={`Are you sure you want to delete "${selectedRequest?.name || "this boarding house type"}"?`}
                onOk={handleSelectDelete}
                onCancel={() => {
                    setIsOpenDeleteModal(false);
                    setSelectedRequest(null);
                }}
                isOpen={isOpenDeleteModal}
            />
            <CreateBoardingHouseType
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleAddNew}
            />
            <UpdateBoardingHouseType
                visible={isUpdateModalVisible}
                onClose={() => setIsUpdateModalVisible(false)}
                recordId={editingRecordId}
                onSuccess={fetchData}
            />
        </div>
    );
}

export default BoardingHouseTypeManagement;