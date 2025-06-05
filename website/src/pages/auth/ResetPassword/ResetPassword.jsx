import { Form, Button, Card, Input } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../../api/authManagement";
import { useTheme } from "../../../context/themeContext";

function ResetPassword() {
  const { token } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const data = { ...values, token };
      const res = await resetPassword(data);
      toast.success(res.message);
      navigate("/");
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Invalid token");
      navigate("/");
    }
  }, [token, navigate]);

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
        <h2
          className={`font-body text-4xl font-bold text-center mb-5 ${
            darkMode ? "text-white" : "text-gray-900"
          } transition-colors duration-300`}
        >
          Reset Password
        </h2>

        <Form
          form={form}
          name="resetPassword"
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
                Password
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              {
                min: 5,
                message: "Password must be at least 5 characters!",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your password"
              autoComplete="new-password"
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

          <Form.Item
            label={
              <span
                className={`${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-300`}
              >
                Confirm Password
              </span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please input your confirm password!",
              },
              {
                min: 5,
                message: "Confirm password must be at least 5 characters!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The confirm password that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your confirm password"
              autoComplete="new-password"
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
              block
              size="large"
              className={`${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                  : "bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              } transition-all duration-300`}
              style={{
                backgroundColor: darkMode ? "#2563EB" : "#3B82F6",
                borderColor: darkMode ? "#2563EB" : "#3B82F6",
              }}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ResetPassword;
