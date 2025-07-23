import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tag, Tooltip, message, Modal } from "antd";
import { getAppointmentsByOwnerId, getAppointmentDetailForOwner, updateAppointmentStatus } from "../../../api/appointmentAPI";
import moment from "moment";
import AppointmentDetail from "./AppointmentDetails";
import { useCurrentUser } from '@/context/userContext';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';
import { FileTextOutlined } from '@ant-design/icons';

const ViewListAppointmentOwner = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { boardingHouseId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointment, setAppointment] = useState(null);
    const { t } = useTranslation('appointment');
    const { darkMode } = useTheme();

    const { user } = useCurrentUser();
    const ownerId = user?._id;
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [paginationOptions, setPaginationOptions] = useState({
        page: 1,
        limit: 10,
    });

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await getAppointmentsByOwnerId(ownerId, paginationOptions);
            // console.log("1", ownerId);
            // console.log("2", response);


            if (response?.data) {
                const numberedAppointments = response.data.map((item, index) => ({
                    ...item,
                    number: (paginationOptions.page - 1) * paginationOptions.limit + index + 1,
                }));
                setAppointments(numberedAppointments);
                setPagination({
                    current: response.pagination.currentPage,
                    pageSize: response.pagination.limit,
                    total: response.pagination.totalItems,
                });
            } else {
                setAppointments([]);
                message.warning("Không có dữ liệu.");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            message.error("Không thể lấy danh sách lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };
    const handleTableChange = (pagination) => {
        setPaginationOptions({
            ...paginationOptions,
            page: pagination.current,
            limit: pagination.pageSize,
        });
    };

    useEffect(() => {
        if (ownerId) {
            fetchAppointments();
        } else {
            message.error("Không tìm thấy thông tin chủ trọ.");
        }
    }, [ownerId, paginationOptions]);

    const fetchAppointmentDetail = async (appointmentId) => {
        try {
            const res = await getAppointmentDetailForOwner(appointmentId);

            console.log(res);

            const formattedAppointment = {
                _id: res._id,
                tenant: res.tenant ? { ...res.tenant } : {},
                room: res.room ? { ...res.room } : {},
                appointmentDate: res.appointmentDate ? moment(res.appointmentDate).format("YYYY-MM-DD HH:mm") : "no date",
                userNote: res.userNote || "No note",
                status: res.status || "unknown",
                reasonForCancel: res.reasonForCancel || null,
            };

            setAppointment(formattedAppointment);
            setIsModalOpen(true);

        } catch (error) {
            message.error("Lỗi lấy thông tin chi tiết cuộc hẹn.");
            console.error("API Error:", error);
        }
    };
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateAppointmentStatus(id, newStatus); // gọi API
            message.success("Cập nhật trạng thái thành công");
            fetchAppointments(); // reload lại bảng
        } catch (err) {
            message.error("Lỗi cập nhật trạng thái");
        }
    };

    useEffect(() => {
        fetchAppointments(); // Gọi hàm
    }, [isModalOpen]);
    const columns = [
        {
            title: t('columns.name'),
            dataIndex: "boardingHouseName",
            key: "boardingHouseName",
        },
        {
            title: t('columns.customerName'),
            dataIndex: "tenantName",
            key: "tenantName",
        },
        {
            title: t('columns.roomNumber'),
            dataIndex: "roomNumber",
            key: "roomNumber",
        },
        {
            title: t('columns.date'),
            dataIndex: "appointmentDate",
            key: "appointmentDate",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: t('columns.note'),
            dataIndex: "note",
            key: "note",
            render: (text) => (
                <Tooltip title={text}>
                    {text && text.length > 50 ? `${text.slice(0, 50)}...` : text}
                </Tooltip>
            ),
        },
        {
            title: t('columns.status'),
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={
                    status === "pending"
                        ? "orange"
                        : status === "accepted"
                            ? "green"
                            : status === "rejected"
                                ? "red"
                                : "default"
                }>
                    {t(`status.${status}`)}
                </Tag>
            )
        },
        // {
        //     title: t('columns.actions'),
        //     key: "action",
        //     render: (_, record) => (
        //         <div style={{ display: "flex", gap: "8px" }}>
        //             <Button
        //                 title={t('buttons.detail')}
        //                 icon={<FileTextOutlined />}
        //                 style={{
        //                     backgroundColor: "rgb(5, 150, 105)",
        //                     color: "white",
        //                 }}
        //                 className="text-white"
        //                 bgColor="rgb(5 150 105)"
        //                 size="large"
        //                 onClick={() => fetchAppointmentDetail(record._id)}
        //             >
        //                 {t('buttons.detail')}
        //             </Button>
        //         </div>
        //     ),
        // },
    ];

    return (
        <div className="min-h-[500px]">

            <Table
                tableName={t('columns.tableName')}
                columns={columns}
                data={appointments}
                loading={loading}
                rowKey="_id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                onChange={handleTableChange}

                onRowClick={(record) => fetchAppointmentDetail(record._id)}

            />
            <Modal
                title={<span style={{ fontSize: "16px", fontWeight: "bold" }}>{t('modal.title')}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="400px"
                style={{ top: 20 }}
                bodyStyle={darkMode ? { background: "#1f2937", color: "#f9fafb" } : {}}
            >
                {appointment ? (
                    <AppointmentDetail appointment={appointment}
                        onAcceptSuccess={() => {
                            fetchAppointments();
                            setIsModalOpen(false);
                        }} />
                ) : (
                    <p>{t('loading')}</p>
                )}
            </Modal>
        </div>
    );
};

export default ViewListAppointmentOwner;