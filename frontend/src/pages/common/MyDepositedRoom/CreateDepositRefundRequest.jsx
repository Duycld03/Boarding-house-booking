import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { createRefundRequest } from "@/api/refundRequestManagement";

function CreateDepositRefundRequest({ isVisible, setVisible, depositRoom }) {
  const [reasonForRefund, setReasonForRefund] = useState("");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    if (!reasonForRefund) {
      toast.error("Please enter a reason for the refund request");
      return;
    }

    try {
      const payload = {
        depositRoomId: depositRoom._id,
        amountRefunded: depositRoom.amount,
        reason: reasonForRefund,
      };
      const res = await createRefundRequest(payload);
      toast.success(res.message);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating the refund request."
      );
    } finally {
      setLoading(false);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setReasonForRefund("");
  };

  return (
    <Modal
      form={form}
      title="Create Deposit Refund Request"
      open={isVisible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="Submit"
      width="400px"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item
          label="Reason For Refund"
          name="reasonForRefund"
          rules={[
            {
              required: true,
              message: "Please enter a reason for the refund request",
            },
          ]}
        >
          <Input.TextArea
            placeholder="Enter reason for refund request"
            value={reasonForRefund}
            onChange={(e) => setReasonForRefund(e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateDepositRefundRequest;
