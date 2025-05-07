import { Modal, Form, Input } from "antd";
import React, { useEffect } from "react";
import { sendOTPChangeEmail } from "../../../../api/AccountManagement";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ChangeEmailModal({ isOpen, email, setToggleModal }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onCancel = () => {
    setToggleModal(false);
    form.setFieldsValue({ email });
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const res = await sendOTPChangeEmail(values);
      toast.success(res.message);
      navigate("/verify-change-email", {
        state: { email: res.email, token: res.token },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      onCancel();
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ email });
  }, [email]);

  return (
    <Modal
      title="Change Email"
      open={isOpen}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} onFinish={handleSave} layout="vertical">
        <Form.Item name="email" className="mt-10">
          <Input size="large" placeholder="Enter your email" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
