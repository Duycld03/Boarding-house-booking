import React from "react";
import { Card, Avatar, Tag, Typography, Form } from "antd";
import moment from "moment";
import DefaultAccount from "@/assets/images/none_avatar.png";

const { Title, Text } = Typography;

const AppointmentDetail = ({ appointment }) => {
    console.log("Appointment props:", appointment);

    if (!appointment || Object.keys(appointment).length === 0) {
        return <Text>Đang tải...</Text>;
    }

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

    return (
        <Card className="max-w-2xl mx-auto p-4">
            <Form.Item style={{ marginBottom: 8 }}>
                <div className="flex flex-col items-center text-center">
                    <Avatar
                        src={tenant?.accountId?.avatarImage?.url ?? DefaultAccount}
                        size={50}
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
                    <Text className="">{userNote || "No Note"}</Text>
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
        </Card>
    );
};

export default AppointmentDetail;