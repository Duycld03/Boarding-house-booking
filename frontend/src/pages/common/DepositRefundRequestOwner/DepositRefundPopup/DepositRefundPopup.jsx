import { payDeposit } from "@/api/depositManagement";
import { acceptRefundRequestForOwner } from "@/api/ownerUser/refundRequestManagement";
import formatAmount from "@/utils/formatAmount";
import { Form, Modal, Radio } from "antd";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function DepositRefundPopup({ visible, setVisible, depositRefundData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await acceptRefundRequestForOwner(
        depositRefundData._id,
        values
      );
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
      title="Deposit Refund"
      open={visible}
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
          Amount Refund:
          <span className="font-semibold">
            {` ${formatAmount(depositRefundData?.amountRefunded)}`} VND
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

export default DepositRefundPopup;
