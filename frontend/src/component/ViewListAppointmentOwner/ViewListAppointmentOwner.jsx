import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Tag, Button, Tooltip, message, Modal } from "antd";
import { getAppointmentsByBoardingHouseId, getAppointmentDetailForOwner } from "../../api/appointment";
import moment from "moment";
import AppointmentDetail from "../AppointmentDetailsOwner";

const ViewListAppointmentOwner = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { boardingHouseId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointment, setAppointment] = useState(null);
    useEffect(() => {
        if (boardingHouseId) fetchAppointments();
    }, [boardingHouseId]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await getAppointmentsByBoardingHouseId(boardingHouseId);
            console.log(response);

            if (response?.data) {
                const numberedAppointments = response.data.map((item, index) => ({
                    ...item,
                    number: index + 1,
                }));
                setAppointments(numberedAppointments);
            } else {
                setAppointments([]);
                message.warning("Không có dữ liệu lịch hẹn.");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            message.error("Không thể lấy danh sách lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };
    const fetchAppointmentDetail = async (appointmentId) => {
        try {
            const res = await getAppointmentDetailForOwner(appointmentId);

            const formattedAppointment = {
                tenant: res.tenant ? { ...res.tenant } : {},
                room: res.room ? { ...res.room } : {},
                appointmentDate: res.appointmentDate ? moment(res.appointmentDate).format("YYYY-MM-DD HH:mm") : "Không có ngày hẹn",
                userNote: res.userNote || "Không có ghi chú",
                status: res.status || "unknown",
                reasonForCancel: res.reasonForCancel || null
            };

            setAppointment(formattedAppointment);
            setIsModalOpen(true);

        } catch (error) {
            message.error("Lỗi lấy thông tin chi tiết cuộc hẹn.");
            console.error("API Error:", error);
        }
    };
    useEffect(() => {
        console.log("Modal Open State:", isModalOpen);
    }, [isModalOpen]);
    // const handleUpdateStatus = async () => {  
    // };

    const columns = [
        {
            title: "No",
            dataIndex: "number",
            key: "number",
            width: 60,
        },
        {
            title: "Customer Name",
            dataIndex: ["accountId", "fullname"],
            key: "fullname",
            render: (text) => text || "Không có tên",
            width: 150,

        },
        {
            title: "Room Number",
            dataIndex: ["roomId", "roomNumber"],
            key: "roomNumber",
            width: 150,

        },
        {
            title: "Appointment Date",
            dataIndex: "appointmentDate",
            key: "appointmentDate",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
            width: 200,

        },
        {
            title: "Note",
            dataIndex: "note",
            key: "note",
            render: (text) => (
                <Tooltip title={text}>
                    {text && text.length > 50 ? `${text.substring(0, 50)}...` : text}
                </Tooltip>
            ),
            width: 250,

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
                                : "red"
                    }
                >
                    {status}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "action",

            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        type="primary"
                        onClick={() => handleUpdateStatus(record._id, "accepted")}
                        disabled={record.status === "accepted"}
                    >
                        Accept
                    </Button>
                    <Button
                        type="default"
                        danger
                        onClick={() => handleUpdateStatus(record._id, "cancelled")}
                        disabled={record.status === "cancelled"}
                    >
                        Cancel
                    </Button>

                    <Button
                        title="Detail"
                        style={{ backgroundColor: "rgb(5, 150, 105)", color: "white", width: "80px" }}
                        onClick={() => fetchAppointmentDetail(record._id)}
                    >
                        Detail
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-[500px]">

            <Table
                columns={columns}
                dataSource={appointments}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Appointment Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="400px"
                style={{ top: 20 }}
                bodyStyle={{ padding: "20px" }}
            >
                {appointment ? (
                    <AppointmentDetail appointment={appointment} />
                ) : (
                    <p>Đang tải...</p>
                )}
            </Modal>
        </div>
    );
};

export default ViewListAppointmentOwner;