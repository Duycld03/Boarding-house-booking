import { payDeposit, payRent } from "@/api/depositAPI";
import formatAmount from "@/utils/formatAmount";
import { Form, Modal, Radio } from "antd";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function PayDepositPopup({ isVisible, setVisible, payDepositData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    const payload = { depositRoomId: payDepositData._id, ...values };
    try {
      const res = await payDeposit(payload);
      window.location.href = res.payUrl;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      handleCancel();
    }
  };

  return (
    <Modal
      title="Pay Deposit"
      open={isVisible}
      onCancel={handleCancel}
      confirmLoading={loading}
      onOk={form.submit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ paymentMethod: "vnpay" }}
      >
        <Form.Item name="amount" className="mb-2">
          Amount:
          <span className="font-semibold">
            {` ${formatAmount(payDepositData.amount)}`} VND
          </span>
        </Form.Item>

        <Form.Item label="Select a payment" name="paymentMethod">
          <Radio.Group>
            <Radio value="vnpay">VNPay</Radio>
            <Radio value="momo">Momo</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default PayDepositPopup;
