import { useEffect, useState, useMemo, useCallback } from "react";
import { getAppointmentsByOwnerId, updateAppointmentStatus } from "../../../api/appointmentAPI";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import { toast } from "react-toastify";
import convertTimetap from "../../../utils/convertTimetap";
import { Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useParams } from "react-router-dom";

function OwnerAppointments() {
    const [appointmentData, setAppointmentData] = useState([]);
    const { t } = useTranslation("ownerAppointments");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { darkMode } = useTheme();
    const { ownerId } = useParams(); // Lấy ownerId từ route
    const [selectedData, setSelectedData] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
    });

    const [paginationOptions, setPaginationOptions] = useState({
        page: 1,
        limit: 10,
        sortField: "createdAt",
        sortOrder: "desc",
    });

    const tablePaginationConfig = useMemo(
        () => ({
            current: pagination.currentPage,
            pageSize: pagination.limit,
            total: pagination.totalItems,
            showSizeChanger: true,
        }),
        [pagination]
    );

    const statusColors = {
        pending: "blue",
        accepted: "orange",
        canceled: "red",
        completed: "green",
    };

    // Cột hiển thị thông tin của bảng
    const appointmentCol = [
        {
            title: t("boardingHouseName"), // Tên nhà trọ
            dataIndex: "boardingHouseName",
            key: "boardingHouseName",
        },
        {
            title: t("userName"), // Tên người đặt hẹn
            dataIndex: "userName",
            key: "userName",
        },
        {
            title: t("roomNumber"), // Số phòng
            dataIndex: "roomNumber",
            key: "roomNumber",
        },
        {
            title: t("appointmentDate"), // Ngày hẹn
            dataIndex: "appointmentDate",
            key: "appointmentDate",
            render: (date) => convertTimetap(date, true),
        },
        {
            title: t("note"), // Ghi chú
            dataIndex: "note",
            key: "note",
            render: (note) =>
                note?.length > 30 ? (
                    <Tooltip title={note}>{note.substring(0, 30)}...</Tooltip>
                ) : (
                    note
                ),
        },
        {
            title: t("status"), // Trạng thái
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
        },
    ];

    // Hàm lấy danh sách appointments từ API
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAppointmentsByOwnerId(ownerId, paginationOptions);
            setPagination({
                currentPage: res.currentPage,
                totalPages: res.totalPages,
                totalItems: res.pagination.totalItems,
                limit: res.limit,
            });
            if (res.data === 0) {
                toast.info(t("noData"));
            } else {
                setAppointmentData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [ownerId, paginationOptions]);

    // Gọi API khi component được mount hoặc khi paginationOptions thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTableChange = useCallback(
        (pagination, filters, sorter) => {
            const newPaginationOptions = {
                ...paginationOptions,
                page: pagination.current,
                limit: pagination.pageSize,
            };

            setPaginationOptions(newPaginationOptions);
        },
        [paginationOptions]
    );

    return (
        <div className="min-h-[500px]">
            <Table
                loading={loading}
                tableName={t("appointmentTableName")}
                columns={appointmentCol}
                data={appointmentData ?? []}
                onChange={handleTableChange}
                pagination={tablePaginationConfig}
            />
        </div>
    );
}

export default OwnerAppointments;