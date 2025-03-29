import React from "react";
import { Card, Avatar, Tag, Typography, Form, Modal } from "antd";
import { Button } from '@/component';
import { useEffect } from "react";
import moment from "moment";
import DefaultAccount from "@/assets/images/none_avatar.png";
import { acceptAppointment, rejectAppointment } from '../../../../api/appointment';
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const AppointmentDetail = ({ appointment, onAcceptSuccess = () => { } }) => {
    if (!appointment || Object.keys(appointment).length === 0) {
        return <Text>Đang tải...</Text>;
    }
    useEffect(() => {
        console.log("appointment passed to child component:", appointment);
    }, [appointment]);
    const {
        tenant,
        room,
        appointmentDate,
        userNote,
        status,
        reasonForCancel,
    } = appointment;

    const getStatusTag = (status) => {
        switch (status) {
            case "accept":
                return <Tag color="green">Accepted</Tag>;
            case "pending":
                return <Tag color="orange">Pending</Tag>;
            case "cancelled":
                return <Tag color="red">Cancelled</Tag>;

        }
    };
    const handleAccept = async () => {
        if (!appointment?._id) {
            toast("Appointment ID is missing!");
            return;
        }

        try {
            const res = await acceptAppointment(appointment._id);
            toast("Appointment accepted successfully!");
            onAcceptSuccess();
        } catch (err) {
            const error = err.response?.data;
            if (error?.requiresConfirmation) {
                const confirm = window.confirm(error.message);
                if (confirm) {
                    try {
                        await acceptAppointment(appointment._id, true);
                        toast("Appointment accepted with overlap!");
                    } catch (confirmErr) {
                        toast(confirmErr.response?.data?.message || "Failed to accept appointment after confirmation.");
                    }
                }
            } else {
                toast(error?.message || "Something went wrong.");
            }
        }
    };
    const handleReject = () => {

        Modal.confirm({
            title: "Confirm Rejection",
            content: "Are you sure you want to reject this appointment?",
            okText: "Reject",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await rejectAppointment(appointment._id);
                    toast.success("Appointment rejected successfully.");
                    onAcceptSuccess();
                } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to reject appointment.");
                }
            },
        });
    };
    return (
        <Card className="max-w-xl mx-auto border-none shadow-none" bordered={false} style={{ background: "transparent" }}>
            <Form.Item style={{ marginBottom: 8 }}>
                <div className="flex flex-col items-center text-center">
                    <Avatar
                        src={tenant?.avatarImage?.url || DefaultAccount}
                        size={64}
                        alt="Avatar"
                    />
                    <Title level={4} className="mt-2">
                        {tenant?.fullName || "Không có tên"}
                    </Title>
                </div>
            </Form.Item>

            <Form className="space-y-2">
                <Form.Item label="Email" style={{ marginBottom: 8 }}>
                    <Text>{tenant?.email || "No Email"}</Text>
                </Form.Item>

                <Form.Item label="Phone Number" style={{ marginBottom: 8 }}>
                    <Text>{tenant?.phoneNumber || "No Phone Number"}</Text>
                </Form.Item>

                <Form.Item label="Room Number" style={{ marginBottom: 8 }}>
                    <Text>{room?.number || "No Room Number"}</Text>
                </Form.Item>

                <Form.Item label="Appointment Date" style={{ marginBottom: 8 }}>
                    <Text>
                        {appointmentDate ? moment(appointmentDate).format("DD/MM/YYYY HH:mm") : "No Appointment Date"}
                    </Text>
                </Form.Item>

                <Form.Item label="Note" style={{ marginBottom: 8 }}>
                    <Text>{userNote || "No Note"}</Text>
                </Form.Item>

                <Form.Item label="Status" style={{ marginBottom: 8 }}>
                    {getStatusTag(status)}
                </Form.Item>

                {reasonForCancel && (
                    <Form.Item label="Cancel Reason" style={{ marginBottom: 8 }}>
                        <Text type="danger">{reasonForCancel}</Text>
                    </Form.Item>
                )}
            </Form>

            <div className="flex gap-3 items-center justify-between mt-8">
                <Button
                    title="Accept"
                    size="large"
                    btnAccept
                    className="text-white"
                    bgColor="rgb(5 150 105)"
                    onClick={handleAccept}
                />
                <Button
                    title="Reject"
                    iconPosition="left"
                    btnReject
                    size="large"
                    style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
                    onClick={handleReject}
                />
            </div>
        </Card>
    );
};
export default AppointmentDetail;