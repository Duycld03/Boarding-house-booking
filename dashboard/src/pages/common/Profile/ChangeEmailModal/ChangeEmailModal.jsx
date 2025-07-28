import { Modal, Form, Input } from "antd";
import React, { useEffect } from "react";
import { sendOTPChangeEmail } from "../../../../api/accountAPI";
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

  // Dark mode styles
  const darkModeStyles = {
    modal: {
      // Modal content background
      ".ant-modal-content": {
        backgroundColor: "#1f1f1f",
        borderColor: "#434343",
      },
      // Modal header
      ".ant-modal-header": {
        backgroundColor: "#1f1f1f",
        borderBottomColor: "#434343",
      },
      // Modal title
      ".ant-modal-title": {
        color: "#ffffff",
      },
      // Modal body
      ".ant-modal-body": {
        backgroundColor: "#1f1f1f",
      },
      // Modal footer
      ".ant-modal-footer": {
        backgroundColor: "#1f1f1f",
        borderTopColor: "#434343",
      },
      // Close button
      ".ant-modal-close": {
        color: "#ffffff",
      },
      ".ant-modal-close:hover": {
        color: "#40a9ff",
      },
      // Buttons
      ".ant-btn-default": {
        backgroundColor: "#1f1f1f",
        borderColor: "#434343",
        color: "#ffffff",
      },
      ".ant-btn-default:hover": {
        backgroundColor: "#333333",
        borderColor: "#40a9ff",
        color: "#40a9ff",
      },
      ".ant-btn-primary": {
        backgroundColor: "#1890ff",
        borderColor: "#1890ff",
      },
      ".ant-btn-primary:hover": {
        backgroundColor: "#40a9ff",
        borderColor: "#40a9ff",
      },
    },
    form: {
      // Form labels
      ".ant-form-item-label > label": {
        color: "#ffffff",
      },
      // Input fields
      ".ant-input": {
        backgroundColor: "#1f1f1f",
        borderColor: "#434343",
        color: "#ffffff",
      },
      ".ant-input:hover": {
        borderColor: "#40a9ff",
      },
      ".ant-input:focus": {
        backgroundColor: "#1f1f1f",
        borderColor: "#40a9ff",
        boxShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
      },
      ".ant-input::placeholder": {
        color: "#8c8c8c",
      },
    },
  };

  return (
    <>
      {/* Dark mode styles injection */}
      <style jsx global>{`
        .dark-modal .ant-modal-content {
          background-color: #1f1f1f !important;
          border-color: #434343 !important;
        }
        .dark-modal .ant-modal-header {
          background-color: #1f1f1f !important;
          border-bottom-color: #434343 !important;
        }
        .dark-modal .ant-modal-title {
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-body {
          background-color: #1f1f1f !important;
        }
        .dark-modal .ant-modal-footer {
          background-color: #1f1f1f !important;
          border-top-color: #434343 !important;
        }
        .dark-modal .ant-modal-close {
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-close:hover {
          color: #40a9ff !important;
        }
        .dark-modal .ant-btn-default {
          background-color: #1f1f1f !important;
          border-color: #434343 !important;
          color: #ffffff !important;
        }
        .dark-modal .ant-btn-default:hover {
          background-color: #333333 !important;
          border-color: #40a9ff !important;
          color: #40a9ff !important;
        }
        .dark-modal .ant-btn-primary {
          background-color: #1890ff !important;
          border-color: #1890ff !important;
        }
        .dark-modal .ant-btn-primary:hover {
          background-color: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        .dark-modal .ant-form-item-label > label {
          color: #ffffff !important;
        }
        .dark-modal .ant-input {
          background-color: #1f1f1f !important;
          border-color: #434343 !important;
          color: #ffffff !important;
        }
        .dark-modal .ant-input:hover {
          border-color: #40a9ff !important;
        }
        .dark-modal .ant-input:focus {
          background-color: #1f1f1f !important;
          border-color: #40a9ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }
        .dark-modal .ant-input::placeholder {
          color: #8c8c8c !important;
        }

        /* Dark mode mask overlay */
        .dark-mode .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.7) !important;
        }
      `}</style>

      <Modal
        title="Change Email"
        open={isOpen}
        onCancel={onCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        destroyOnClose
        className="dark-modal"
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="email" className="mt-10">
            <Input size="large" placeholder="Enter your email" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
