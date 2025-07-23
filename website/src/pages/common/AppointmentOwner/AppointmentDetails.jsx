import React, { useEffect, useState } from "react";
import { Card, Avatar, Tag, Typography, Form, Modal } from "antd";
import { Button } from '@/component';
import moment from "moment";
import DefaultAccount from "@/assets/images/none_avatar.png";
import { acceptAppointment, rejectAppointment } from "../../../api/appointmentAPI";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';
import { Input } from 'antd';

const AppointmentDetail = ({ appointment, onAcceptSuccess = () => { } }) => {
    const { Title, Text } = Typography;
    const { t, i18n } = useTranslation('appointment');
    const { darkMode } = useTheme();

    if (!appointment || Object.keys(appointment).length === 0) {
        return <Text style={{ color: darkMode ? '#fff' : undefined }}>{t('loading')}</Text>;
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
            case "accepted":
                return <Tag color="green">{t('status.accepted')}</Tag>;
            case "pending":
                return <Tag color="orange">{t('status.pending')}</Tag>;
            case "rejected":
                return <Tag color="red">{t('status.rejected')}</Tag>;
            default:
                return <Tag>{t('status.unknown')}</Tag>;
        }
    };

    const handleAccept = async () => {
        if (!appointment?._id) {
            toast("Appointment ID is missing!");
            return;
        }

        try {
            await acceptAppointment(appointment._id);
            toast.success("Appointment accepted successfully!");
            onAcceptSuccess();
        } catch (err) {
            const error = err.response?.data;
            if (error?.requiresConfirmation) {
                const confirm = window.confirm(error.message);
                if (confirm) {
                    try {
                        await acceptAppointment(appointment._id, true);
                        toast.success("Appointment accepted with overlap!");
                    } catch (confirmErr) {
                        toast.error(confirmErr.response?.data?.message || "Failed to accept appointment after confirmation.");
                    }
                }
            } else {
                toast.error(error?.message || "Something went wrong.");
            }
        }
    };

    const handleReject = () => {
        const textStyle = { color: darkMode ? '#fff' : undefined };
        let reason = '';

        Modal.confirm({
            title: <span style={textStyle}>{t('modal.rejectTitle')}</span>,
            content: (
                <div>
                    <p style={textStyle}>{t('modal.rejectContent')}</p>
                    <Input.TextArea
                        rows={4}
                        placeholder={t('fields.enterCancelReason')}
                        onChange={(e) => {
                            reason = e.target.value;
                        }}
                    />
                </div>
            ),
            okText: t('buttons.reject'),
            okType: "danger",
            cancelText: t('buttons.cancel'),
            okButtonProps: {
                style: {
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                },
            },
            cancelButtonProps: {
                style: {
                    backgroundColor: darkMode ? '#374151' : undefined,
                    color: darkMode ? '#fff' : undefined,
                },
            },
            onOk: async () => {
                if (!reason.trim()) {
                    toast.error(t('messages.rejectReasonRequired'));
                    throw new Error("Reason required");
                }

                try {
                    await rejectAppointment(appointment._id, { reason });
                    toast.success(t('messages.rejectSuccess'));
                    onAcceptSuccess();
                } catch (err) {
                    toast.error(err.response?.data?.message || t('messages.rejectFailed'));
                }
            }
        });
    };

    useEffect(() => {
        console.log("appointment passed to child component:", appointment);
    }, [appointment]);
    const labelStyle = { color: darkMode ? '#ddd' : undefined };
    const textStyle = { color: darkMode ? '#fff' : undefined };

    return (
        <Card
            className="max-w-xl mx-auto border-none shadow-none"
            bordered={false}
            style={{
                background: darkMode ? "#1f2937" : "transparent",
                color: darkMode ? "#f9fafb" : undefined,
            }}
        >
            <Form.Item style={{ marginBottom: 8 }}>
                <div className="flex flex-col items-center text-center">
                    <Avatar src={tenant?.avatarImage?.url || DefaultAccount} size={64} />
                    <Title level={4} style={textStyle}>
                        {tenant?.fullName || t('fields.noName')}
                    </Title>
                </div>
            </Form.Item>

            <Form className="space-y-2">
                <Form.Item label={<span style={labelStyle}>{t('fields.email')}</span>}>
                    <Text style={textStyle}>{tenant?.email || t('fields.noEmail')}</Text>
                </Form.Item>
                <Form.Item label={<span style={labelStyle}>{t('fields.phone')}</span>}>
                    <Text style={textStyle}>{tenant?.phoneNumber || t('fields.noPhone')}</Text>
                </Form.Item>
                <Form.Item label={<span style={labelStyle}>{t('fields.roomNumber')}</span>}>
                    <Text style={textStyle}>{room?.number || t('fields.noRoom')}</Text>
                </Form.Item>
                <Form.Item label={<span style={labelStyle}>{t('fields.date')}</span>}>
                    <Text style={textStyle}>
                        {appointmentDate
                            ? moment(appointmentDate).format("DD/MM/YYYY HH:mm")
                            : t('fields.noDate')}
                    </Text>
                </Form.Item>
                <Form.Item label={<span style={labelStyle}>{t('fields.note')}</span>}>
                    <Text style={textStyle}>
                        {!userNote || userNote.trim().toLowerCase() === 'no note'
                            ? t('fields.noNote')
                            : userNote}
                    </Text>
                </Form.Item>
                <Form.Item label={<span style={labelStyle}>{t('fields.status')}</span>}>
                    {getStatusTag(status)}
                </Form.Item>
                {reasonForCancel && (
                    <Form.Item
                        label={<span style={labelStyle}>{t('fields.cancelReason')}</span>}
                    >
                        <Text style={{ ...textStyle }}>
                            {reasonForCancel}
                        </Text>
                    </Form.Item>
                )}
            </Form>

            {status === "pending" && (
                <div className="flex gap-3 items-center justify-between mt-8">
                    <Button
                        title={t('buttons.accept')}
                        size="large"
                        btnAccept
                        className="text-white"
                        bgColor="rgb(5 150 105)"
                        onClick={handleAccept}
                    />
                    <Button
                        title={t('buttons.reject')}
                        iconPosition="left"
                        btnReject
                        size="large"
                        style={{ backgroundColor: 'red', color: 'white' }}
                        onClick={handleReject}
                    />
                </div>
            )}

        </Card>
    );
};

export default AppointmentDetail;
