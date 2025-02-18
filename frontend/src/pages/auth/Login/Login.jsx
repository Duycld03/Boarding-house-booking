import { useEffect, useState } from "react";
import { Form, Button, Checkbox, Card, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { login, getUser, loginWithGoogle } from "../../../api/authManagement";
import { Back } from "../../../component";
import { useCurrentUser } from "../../../context/userContext";

function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { loginData } = useCurrentUser();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await login(values);
      const role = res.user.role;
      loginData(res.user);

      localStorage.setItem("access_token", res.token);

      if (location.key !== "default") {
        navigate(-1);
      } else {
        if (role === "user" || role === "owner") {
          navigate("/");
        } else if (role === "admin") {
          navigate("/dashboard/account-management");
        }
      }
      toast.success("Login successful");
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
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

  const loginWithGoogleHandler = async (response) => {
    try {
      const remember = form.getFieldValue("remember");
      const data = { ...response, remember };
      const res = await loginWithGoogle(data);

      if (res.isRegistered) {
        localStorage.setItem("access_token", res.token);
        navigate("/");
        toast.success("Login successful");
      } else {
        navigate("/register-with-google", { state: { user: res.user } });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
      <Card
        style={{
          width: 400,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p className="mb-5">
          <Back />
        </p>

        <h2 className={"font-body text-4xl font-bold text-center mb-5"}>
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
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input size="large" placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Password"
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
              autoComplete="current-password"
            />
          </Form.Item>
          <div>
            <p className="text-right">
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </span>
            </p>
          </div>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
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
            <GoogleLogin
              onSuccess={loginWithGoogleHandler}
              onError={() => {
                console.log("error");
              }}
            />
          </Form.Item>
        </Form>
        <p className="text-center">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </Card>
    </div>
  );
}

export default Login;
