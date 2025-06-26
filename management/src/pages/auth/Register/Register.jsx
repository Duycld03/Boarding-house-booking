import { Form, Button, Card, Input, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUser, sendOTPRegister } from "../../../api/authAPI";
import { Back } from "../../../component";
import { useTheme } from "../../../context/themeContext";
import styles from "./Register.module.css";

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await sendOTPRegister(values);
      toast.success(res.message);
      navigate("/verify-register", {
        state: { account: res.account, token: res.token },
      });
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      await getUser();
      navigate("/");
    } catch (error) {}
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Dark mode styles for Card
  const cardStyle = {
    width: 500,
    boxShadow: darkMode
      ? "0 2px 8px rgba(0, 0, 0, 0.3)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: darkMode ? "#374151" : "#ffffff",
    border: darkMode ? "1px solid #4B5563" : "1px solid #d9d9d9",
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
      } ${styles.themeTransition} flex justify-center items-center h-screen`}
    >
      <Card style={cardStyle}>
        <div className={darkMode ? "text-white" : "text-gray-900"}>
          <p className="mb-5">
            <Back />
          </p>
          <h2
            className={`font-body text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            Register
          </h2>
          <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            name="Register"
            layout="horizontal"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Full Name"
              name="fullname"
              className={darkMode ? styles.darkFormItem : ""}
              rules={[
                {
                  required: true,
                  message: "Please input your fullname!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your fullname"
                className={darkMode ? styles.darkInput : ""}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              className={darkMode ? styles.darkFormItem : ""}
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
                className={darkMode ? styles.darkInput : ""}
              />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              className={darkMode ? styles.darkFormItem : ""}
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your username"
                autoComplete="username"
                className={darkMode ? styles.darkInput : ""}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              className={darkMode ? styles.darkFormItem : ""}
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
                className={darkMode ? styles.darkPasswordInput : ""}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              className={darkMode ? styles.darkFormItem : ""}
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
                className={darkMode ? styles.darkPasswordInput : ""}
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              className={darkMode ? styles.darkFormItem : ""}
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
                {
                  len: 10,
                  message: "Phone number must be 10 characters!",
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                placeholder="Enter your phone number"
                className={
                  darkMode
                    ? `${styles.darkInput} ${styles.darkNumberInput}`
                    : ""
                }
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              className={darkMode ? styles.darkFormItem : ""}
              rules={[
                { required: true, message: "Please select your gender!" },
              ]}
            >
              <Select
                size="large"
                placeholder="Select your gender"
                className={darkMode ? styles.darkSelect : ""}
                dropdownClassName={darkMode ? "dark-dropdown" : ""}
                dropdownStyle={{
                  backgroundColor: darkMode ? "#374151" : "#ffffff",
                  border: darkMode ? "1px solid #4B5563" : "1px solid #d9d9d9",
                }}
              >
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="submit" wrapperCol={{ offset: 4, span: 16 }}>
              <Button
                style={{
                  backgroundColor: "#40BFFF",
                  borderColor: "#40BFFF",
                  color: "#fff",
                  padding: 20,
                }}
                htmlType="submit"
                loading={loading}
                block
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>

      {/* Global styles for dropdown */}
      <style jsx global>{`
        .dark-dropdown .ant-select-item {
          background-color: #374151 !important;
          color: #ffffff !important;
        }

        .dark-dropdown .ant-select-item:hover {
          background-color: #4b5563 !important;
        }

        .dark-dropdown .ant-select-item-option-selected {
          background-color: #40bfff !important;
          color: #ffffff !important;
        }

        .dark-dropdown {
          background-color: #374151 !important;
        }
      `}</style>
    </div>
  );
}

export default Register;
