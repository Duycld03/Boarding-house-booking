import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, ConfirmModal } from "../../../component";
import {
    getAllBoardingHouseTypes,
    createBoardingHouseType,
    softDeleteBoardingHouseType,
    filterBoardingHouseTypes,
} from "../../../api/BoardingHManagement";
import { toast } from "react-toastify";
import CreateBoardingHouseType from "./CreateBoardingHouseType";
import UpdateBoardingHouseType from "./UpdateBoardingHouseType";
import FilterBoardingHouseType from "./FilterBoardingHouseType";

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
            console.log(response);
            if (response && response.data) {
                const formattedData = response.data.map((item) => ({
                    id: item.value,
                    name: item.label,
                    createdAt: item.createdAt || null,
                    updatedAt: item.updatedAt || null,
                }));
                setData(formattedData);
            } else {
                setData([]);
            }
        } catch (error) {
            message.error("Failed to fetch data.");
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
                toast.warn("No results found for the current filter.");
                setData([]);
            }
        } catch (error) {
            console.error("Filter error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to filter boarding house types. Please try again.";
            toast.error(errorMessage);
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
            const errorMessage =
                error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast.error(errorMessage);
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
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleDateString("en-GB"),
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (text) => new Date(text).toLocaleDateString("en-GB"),
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
                        className="btn-delete"
                        onClick={() => handleDeleteModal(record)}
                    />
                    <Button
                        onClick={() => handleOpenUpdateModal(record)}
                        size="large"
                        title="Detail"
                        icon={<FileTextOutlined />}
                        className="text-white"
                        bgColor="rgb(5 150 105)"
                    />
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
                Boarding House Type Management
            </h1>
            <div className="flex justify-between">
                <Button
                    btnAdd
                    title="Add new"
                    size="large"
                    onClick={handleOpenCreateModal}
                ></Button>
                <FilterBoardingHouseType setFilterValue={setFilterValue} />
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                bordered
                locale={{
                    emptyText: filterValue
                        ? "No data available for the current filter"
                        : "No data available",
                }}
            />
            <ConfirmModal
                title="Confirm Deletion"
                content={`Are you sure you want to delete "${selectedRequest?.name || 'this boarding house type'}"?`}
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