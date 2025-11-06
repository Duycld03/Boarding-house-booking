import { Form, Button, Card, Input } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "../../../api/authAPI";
import { Back } from "../../../component";
import { useTheme } from "../../../context/themeContext";

function ForgotPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { darkMode } = useTheme();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await forgotPassword(values);
      toast.success(res.message);
      setLoading(false);
      setCountdown(15);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const intervalId = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(intervalId);
    }
  }, [countdown]);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } flex justify-center items-center h-screen transition-colors duration-300`}
    >
      <Card
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } transition-colors duration-300`}
        style={{
          width: 400,
          boxShadow: darkMode
            ? "0 4px 12px rgba(0, 0, 0, 0.3)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="mb-5">
          <Back />
        </div>

        <h2
          className={`font-body text-4xl font-bold text-center mb-5 ${
            darkMode ? "text-white" : "text-gray-900"
          } transition-colors duration-300`}
        >
          Forgot Password
        </h2>

        <Form
          form={form}
          name="email"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={
              <span
                className={`${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-300`}
              >
                Email
              </span>
            }
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
              {
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter your email"
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } transition-colors duration-300`}
              style={{
                backgroundColor: darkMode ? "#374151" : "white",
                borderColor: darkMode ? "#4B5563" : "#D1D5DB",
                color: darkMode ? "white" : "#111827",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={countdown > 0}
              block
              size="large"
              className={`${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                  : "bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              } transition-all duration-300`}
              style={{
                backgroundColor:
                  countdown > 0
                    ? darkMode
                      ? "#4B5563"
                      : "#9CA3AF"
                    : darkMode
                    ? "#2563EB"
                    : "#3B82F6",
                borderColor:
                  countdown > 0
                    ? darkMode
                      ? "#4B5563"
                      : "#9CA3AF"
                    : darkMode
                    ? "#2563EB"
                    : "#3B82F6",
              }}
            >
              {countdown > 0 ? `Wait ${countdown}s` : "Send Email"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ForgotPassword;
