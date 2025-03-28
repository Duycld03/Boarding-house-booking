import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";

function CreateDepositRefundRequest({
  isModalOpen,
  handleConfirm,
  handleCancel,
}) {
  const [reasonForRefund, setReasonForRefund] = useState("");

  return (
    <Modal
      title="Create Deposit Refund Request"
      open={isModalOpen}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="Submit"
      width="400px"
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
