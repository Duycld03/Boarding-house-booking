import React, { useEffect, useState } from "react";
import { Select, Modal, Button as AntButton, Typography, Spin, Input } from "antd";
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
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
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
                setDetail(response);
                setNewStatus(response.status);
                if (response.status === "cancel") {
                    setCancelReason(response.reasonForCancel || "");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [requestId]);

    const handleStatusChange = (value) => {
        setNewStatus(value);
    };

    const handleConfirmUpdate = () => {
        if (newStatus === "cancel" && !cancelReason.trim()) {
            Modal.error({
                title: "Error",
                content: "Please provide a reason for cancellation.",
            });
            return;
        }
        setShowConfirmPopup(true);
    };

    const handleFinalUpdate = async () => {
        setIsUpdating(true);
        try {
            const payload = {
                status: newStatus,
                reasonForCancel: newStatus === "cancel" ? cancelReason : undefined,
            };
            await updateWithdrawStatus(requestId, payload);
            toast.success("Status updated successfully.");

            setDetail((prev) => ({
                ...prev,
                status: newStatus,
                reasonForCancel: newStatus === "cancel" ? cancelReason : prev.reasonForCancel,
            }));

            if (onStatusUpdate) onStatusUpdate();
            setShowConfirmPopup(false);
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status.");
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
            <div>
                <div className="mb-4">
                    <Text strong>Username:</Text> <Text>{userId?.username || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Fullname:</Text> <Text>{userId?.fullname || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Amount:</Text>{" "}
                    <Text>{amount ? `${amount} ${detail.currency || "USD"}` : "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Status:</Text>{" "}
                    <Select
                        value={newStatus}
                        disabled={status !== "pending"}
                        onChange={handleStatusChange}
                        style={{ width: "100%" }}
                    >
                        <Option value="pending">Pending</Option>
                        <Option value="cancel">Cancel</Option>
                        <Option value="accept">Accept</Option>
                    </Select>
                </div>
                {newStatus === "cancel" && status !== "cancel" ? (
                    <div className="mb-4">
                        <Text strong>Reason for Cancel:</Text>{" "}
                        <Input.TextArea
                            rows={4}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter reason for cancellation"
                        />
                    </div>
                ) : null}
                {status === "cancel" && (
                    <div className="mb-4">
                        <Text strong>Reason for Cancel:</Text>{" "}
                        <Text>{reasonForCancel || "No reason provided"}</Text>
                    </div>
                )}
                <div className="mb-4">
                    <Text strong>Created At:</Text>{" "}
                    <Text>{new Date(createdAt).toLocaleDateString() || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Bank Name:</Text> <Text>{bankName || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Account Number:</Text> <Text>{accountNumber || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Account Holder Name:</Text>{" "}
                    <Text>{accountHolderName || "N/A"}</Text>
                </div>
                <div className="mb-4">
                    <Text strong>Transaction ID:</Text> <Text>{transactionId || "N/A"}</Text>
                </div>
                {status === "pending" && (
                    <div className="text-right">
                        <AntButton
                            type="primary"
                            onClick={handleConfirmUpdate}
                            loading={isUpdating}
                        >
                            Confirm Update
                        </AntButton>
                    </div>
                )}
            </div>

            {/* Confirmation Popup */}
            <Modal
                visible={showConfirmPopup}
                title="Confirm Status Change"
                onOk={handleFinalUpdate}
                onCancel={() => setShowConfirmPopup(false)}
                okText="Yes, Confirm"
                cancelText="Cancel"
            >
                <Text>
                    Are you sure you want to change the status to{" "}
                    <Text strong>{newStatus}</Text>?
                </Text>
                {newStatus === "cancel" && (
                    <div className="mt-4">
                        <Text strong>Reason for Cancel:</Text>{" "}
                        <Text>{cancelReason || "N/A"}</Text>
                    </div>
                )}
            </Modal>
        </Modal>
    );
}

export default Detail;