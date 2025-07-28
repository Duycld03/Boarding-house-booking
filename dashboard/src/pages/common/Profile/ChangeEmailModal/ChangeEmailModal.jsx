import { Modal, Form, Input } from "antd";
import React, { useEffect } from "react";
import { sendOTPChangeEmail } from "../../../../api/accountAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export default function ChangeEmailModal({ isOpen, email, setToggleModal }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const { darkMode } = useTheme();

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
      {/* Conditionally inject dark mode styles only when darkMode is true */}
      {darkMode && (
        <style>{`
          .dark-modal .ant-modal-content {
            background-color: #111827 !important;
            border: 1px solid #374151 !important;
          }
          .dark-modal .ant-modal-header {
            background-color: #111827 !important;
            border-bottom: 1px solid #374151 !important;
          }
          .dark-modal .ant-modal-title {
            color: #f9fafb !important;
            background: none !important;
            border: none !important;
          }
          .dark-modal .ant-modal-header .ant-modal-title {
            color: #f9fafb !important;
            background: transparent !important;
            border: none !important;
          }
          .dark-modal .ant-modal-body {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }
          .dark-modal .ant-modal-footer {
            background-color: #111827 !important;
            border-top: 1px solid #374151 !important;
          }
          .dark-modal .ant-modal-close {
            color: #9ca3af !important;
          }
          .dark-modal .ant-modal-close:hover {
            color: #f9fafb !important;
          }
          .dark-modal .ant-modal-close .ant-modal-close-x {
            color: #9ca3af !important;
          }
          .dark-modal .ant-modal-close:hover .ant-modal-close-x {
            color: #f9fafb !important;
          }
          .dark-modal .ant-btn-default {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #f9fafb !important;
          }
          .dark-modal .ant-btn-default:hover {
            background-color: #374151 !important;
            border-color: #3b82f6 !important;
            color: #3b82f6 !important;
          }
          .dark-modal .ant-btn-primary {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          .dark-modal .ant-btn-primary:hover {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
          }
          .dark-modal .ant-btn-primary:focus {
            background-color: #1d4ed8 !important;
            border-color: #1d4ed8 !important;
          }
          .dark-modal .ant-form-item-label > label {
            color: #f9fafb !important;
          }
          .dark-modal .ant-input {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #f9fafb !important;
          }
          .dark-modal .ant-input:hover {
            border-color: #3b82f6 !important;
            background-color: #1f2937 !important;
          }
          .dark-modal .ant-input:focus {
            background-color: #1f2937 !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          }
          .dark-modal .ant-input::placeholder {
            color: #9ca3af !important;
          }
          .dark-modal .ant-input::-webkit-input-placeholder {
            color: #9ca3af !important;
          }
          .dark-modal .ant-input::-moz-placeholder {
            color: #9ca3af !important;
          }
          .dark-modal .ant-input:-ms-input-placeholder {
            color: #9ca3af !important;
          }
        `}</style>
      )}

      <Modal
        title="Change Email"
        open={isOpen}
        onCancel={onCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        destroyOnClose
        className={darkMode ? "dark-modal" : ""}
        maskStyle={darkMode ? { backgroundColor: "rgba(17, 24, 39, 0.8)" } : {}}
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
