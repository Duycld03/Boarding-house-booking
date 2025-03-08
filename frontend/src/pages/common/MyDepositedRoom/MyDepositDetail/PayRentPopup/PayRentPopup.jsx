import { payRent } from "@/api/depositManagement";
import { Form, Modal, Radio } from "antd";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PayRentPopup({ isVisible, setVisible, payRentData }) {
  const location = useLocation();
  const navigate = useNavigate();
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
