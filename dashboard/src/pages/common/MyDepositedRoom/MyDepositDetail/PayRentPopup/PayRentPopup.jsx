import { payRent } from "@/api/depositManagement";
import formatAmount from "@/utils/formatAmount";
import { Form, Modal, Radio } from "antd";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function PayRentPopup({ isVisible, setVisible, payRentData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    const payload = { ...payRentData, ...values };
    try {
      const res = await payRent(payload);
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
      title="Select a payment"
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
            {` ${formatAmount(payRentData.amount)}`} VND
          </span>
        </Form.Item>
        <Form.Item name="paymentMethod">
          <Radio.Group>
            <Radio value="vnpay">VNPay</Radio>
            <Radio value="momo">Momo</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default PayRentPopup;
