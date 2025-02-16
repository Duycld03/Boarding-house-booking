import React, { useEffect, useState } from "react";
import { Form, Input, Select, Modal, Button as AntButton, Typography, Spin } from "antd";
import { toast } from "react-toastify";
import { getWithdrawRequestDetail, updateWithdrawStatus } from "../../../api/withdrawalrequestmanagement";

const { Text } = Typography;
const { Option } = Select;

function Detail({ requestId, onClose, onStatusUpdate }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showReasonPopup, setShowReasonPopup] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        if (!requestId) {
            setError("Invalid request ID");
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            try {
                const response = await getWithdrawRequestDetail(requestId);
                setDetail(response); // Save detail data
                setNewStatus(response.status); // Set initial status
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [requestId]);

    const handleStatusChange = (value) => {
        if (value === "cancel") {
            setShowReasonPopup(true);
        } else {
            setNewStatus(value);
        }
    };

    const handleConfirmCancel = () => {
        if (!cancelReason.trim()) {
            Modal.error({
                title: "Error",
                content: "Please provide a reason for cancellation.",
            });
            return;
        }
        setNewStatus("cancel");
        setShowReasonPopup(false);
    };

    const handleConfirmUpdate = async () => {
        setIsUpdating(true);
        try {
            const payload = {
                status: newStatus,
                reasonForCancel: newStatus === "cancel" ? cancelReason : undefined,
            };
            await updateWithdrawStatus(requestId, payload);
            toast.success("Update status successfully.");
            if (onStatusUpdate) onStatusUpdate();
            onClose();
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" />
            </div>
        );
    if (error)
        return (
            <div className="text-center">
                <Text type="danger">{error}</Text>
            </div>
        );

    const {
        userId,
        amount,
        createdAt,
        bankDetails,
        transactionId,
        status,
        reasonForCancel,
    } = detail || {};
    const { bankName, accountNumber, accountHolderName } = bankDetails || {};

    return (
        <Modal
            visible={true}
            title="Withdrawal Request Details"
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <Form layout="vertical">
                <Form.Item label="Username">
                    <Input value={userId?.username || "N/A"} readOnly disabled />
                </Form.Item>
                <Form.Item label="Fullname">
                    <Input value={userId?.fullname || "N/A"} readOnly disabled />
                </Form.Item>
                <Form.Item label="Amount">
                    <Input
                        value={amount ? `${amount} ${detail.currency || "USD"}` : "N/A"}
                        readOnly disabled
                    />
                </Form.Item>
                <Form.Item label="Status" required>
                    <Select
                        value={newStatus}
                        disabled={status !== "pending"}
                        onChange={handleStatusChange}
                        style={{ width: "100%" }}
                        required
                    >
                        <Option value="pending">Pending</Option>
                        <Option value="cancel">Cancel</Option>
                        <Option value="accept">Accept</Option>
                    </Select>
                </Form.Item>
                {status === "cancel" || newStatus === "cancel" ? (
                    <Form.Item label="Reason for Cancel">
                        <Input
                            value={reasonForCancel || cancelReason || ""}
                            readOnly
                            disabled
                        />
                    </Form.Item>
                ) : null}
                <Form.Item label="Created At">
                    <Input
                        value={new Date(createdAt).toLocaleDateString() || "N/A"}
                        readOnly disabled
                    />
                </Form.Item>
                <Form.Item label="Bank Name">
                    <Input value={bankName || "N/A"} readOnly disabled />
                </Form.Item>
                <Form.Item label="Account Number">
                    <Input value={accountNumber || "N/A"} readOnly disabled />
                </Form.Item>
                <Form.Item label="Account Holder Name">
                    <Input value={accountHolderName || "N/A"} readOnly disabled />
                </Form.Item>
                <Form.Item label="Transaction ID">
                    <Input value={transactionId || "N/A"} readOnly disabled />
                </Form.Item>
                {status === "pending" && (
                    <Form.Item>
                        <AntButton
                            type="primary"
                            onClick={handleConfirmUpdate}
                            loading={isUpdating}
                            style={{ float: "right" }}
                        >
                            Confirm Update
                        </AntButton>
                    </Form.Item>
                )}
            </Form>
            <Modal
                visible={showReasonPopup}
                title="Reason for Cancellation"
                onCancel={() => setShowReasonPopup(false)}
                onOk={handleConfirmCancel}
                okText="Confirm"
                cancelText="Cancel"
            >
                <Input.TextArea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancellation"
                />
            </Modal>
        </Modal>
    );
}

export default Detail;