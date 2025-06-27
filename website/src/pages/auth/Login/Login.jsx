import { useEffect, useState } from "react";
import { Form, Button, Checkbox, Card, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { login, getUser, loginWithGoogle } from "../../../api/authAPI";
import { Back } from "../../../component";
import { useCurrentUser } from "../../../context/userContext";
import { useTheme } from "../../../context/themeContext";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { darkMode } = useTheme();

  const { loginData } = useCurrentUser();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await login(values);
      const role = res.user.role;
      loginData(res.user, res.token);

      localStorage.setItem("access_token", res.token);

      if (role === "admin") {
        navigate("/dashboard/account-management");
      } else if (location.key !== "default") {
        navigate(-1);
      } else {
        navigate("/");
      }
      toast.success("Login successful");

      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
      setLoading(false);
    }
  };

  const loginWithGoogleHandler = async (response) => {
    try {
      const remember = form.getFieldValue("remember");
      const data = { ...response, remember };
      const res = await loginWithGoogle(data);

      if (res.isRegistered) {
        localStorage.setItem("access_token", res.token);
        loginData(res.user, res.token);

        if (res.user.role === "admin") {
          navigate("/dashboard/account-management");
        } else if (location.key !== "default") {
          navigate(-1);
        } else {
          navigate("/");
        }

        toast.success("Login successful");
      } else {
        navigate("/register-with-google", { state: { user: res.user } });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Dark mode styles for Card
  const cardStyle = {
    width: 400,
    boxShadow: darkMode
      ? "0 2px 8px rgba(0, 0, 0, 0.3)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: darkMode ? "#374151" : "#ffffff",
    border: darkMode ? "1px solid #4B5563" : "1px solid #d9d9d9",
  };

  // Dark mode styles for form items
  const formItemStyle = darkMode
    ? {
        color: "#ffffff",
      }
    : {};

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
            className={`font-body text-4xl font-bold text-center mb-5 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Login
          </h2>

          <Form
            form={form}
            name="login"
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label={
                <span style={{ color: darkMode ? "#ffffff" : "#000000" }}>
                  Username
                </span>
              }
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
                className={darkMode ? styles.darkInput : ""}
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ color: darkMode ? "#ffffff" : "#000000" }}>
                  Password
                </span>
              }
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
                autoComplete="current-password"
                className={darkMode ? styles.darkPasswordInput : ""}
                style={
                  darkMode
                    ? { backgroundColor: "#111827", border: "#111827" }
                    : {}
                }
              />
            </Form.Item>

            <div>
              <p className="text-right">
                <span
                  className={`${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-500 hover:text-blue-600"
                  } ${styles.linkTransition} cursor-pointer`}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </span>
              </p>
            </div>

            <Form.Item
              name="remember"
              valuePropName="checked"
              className={darkMode ? styles.darkCheckbox : ""}
            >
              <Checkbox>
                <span style={{ color: darkMode ? "#ffffff" : "#000000" }}>
                  Remember me
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item>
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
                Login
              </Button>
            </Form.Item>

            <Form.Item>
              <div className={darkMode ? styles.googleLoginDark : ""}>
                <GoogleLogin
                  onSuccess={loginWithGoogleHandler}
                  onError={() => {
                    console.log("error");
                  }}
                />
              </div>
            </Form.Item>
          </Form>

          <p
            className={`text-center ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Don't have an account?{" "}
            <span
              className={`${
                darkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-500 hover:text-blue-600"
              } ${styles.linkTransition} cursor-pointer`}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Login;
