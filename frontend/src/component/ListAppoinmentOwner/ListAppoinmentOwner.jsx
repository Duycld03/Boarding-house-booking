import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Tag, Button, Tooltip, message, Modal } from "antd";
import { getAppointmentsByBoardingHouseId, getAppointmentDetailForOwner } from "../../api/appointment";
import moment from "moment";
import AppointmentDetail from "../../pages/common/BHDetailOwner/AppoinmentDetails";

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
                message.warning("no data");
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
    useEffect(() => {
        fetchAppointments
    }, [isModalOpen]);


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
            width: 160,

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
            width: 210,

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
            width: 260,

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
        // {
        //     title: "Actions",
        //     key: "action",

        //     render: (_, record) => (
        //         <div style={{ display: "flex", gap: "8px" }}>
        //             <Button
        //                 type="primary"
        //                 onClick={() => handleUpdateStatus(record._id, "accepted")}
        //                 disabled={record.status === "accepted"}
        //             >
        //                 Accept
        //             </Button>
        //             <Button
        //                 type="default"
        //                 danger
        //                 onClick={() => handleUpdateStatus(record._id, "cancelled")}
        //                 disabled={record.status === "cancelled"}
        //             >
        //                 Cancel
        //             </Button>

        //             <Button
        //                 title="Detail"
        //                 style={{ backgroundColor: "rgb(5, 150, 105)", color: "white", width: "80px" }}
        //                 onClick={() => fetchAppointmentDetail(record._id)}
        //             >
        //                 Detail
        //             </Button>
        //         </div>
        //     ),
        // },
    ];

    return (
        <div className="min-h-[500px]">

            <Table
                columns={columns}
                dataSource={appointments}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                    onClick: () => fetchAppointmentDetail(record._id),
                })}
            />
            <Modal
                title={
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        Appointment Details
                    </span>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="400px"
                style={{ top: 20 }}
            >
                {appointment ? (
                    <AppointmentDetail appointment={appointment}
                        onAcceptSuccess={() => {
                            fetchAppointments();
                            setIsModalOpen(false);
                        }} />
                ) : (
                    <p>Đang tải...</p>
                )}
            </Modal>
        </div>
    );
};

export default ViewListAppointmentOwner;