import { useEffect } from 'react';
import { Form, Button, Checkbox, Card, Input, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { login, getUser, loginWithGoogle } from '../../../api/authManagement';
import { useEffect } from "react";
import { Form, Button, Checkbox, Card, Input, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, getUser, loginWithGoogle } from "../../../api/authManagement";

function Login() {
  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const showNotification = (description) => {
    api.error({
      message: "Login Failed",
      description: description || "Invalid username or password",
    });
  };

  const onFinish = async (values) => {
    try {
      const res = await login(values);
      const role = res.user.role;

      localStorage.setItem('access_token', res.token);
      localStorage.setItem("access_token", res.token);

      if (role === 'user' || role === 'owner') {
        navigate('/');
      } else if (role === 'admin') {
        navigate('/dashboard/account-management');
      if (role === "user" || role === "owner") {
        navigate("/");
      } else if (role === "admin") {
        navigate("/dashboard/account-management");
      }
    } catch (error) {
      showNotification(error.response.data.message);
      form.resetFields();
    }
  };
  const checkUser = async () => {
    try {
      await getUser();
      navigate('/');
      navigate("/");
    } catch (error) {}
  };

  useEffect(() => {
    checkUser();
  }, []);

  const loginWithGoogleHandler = async (response) => {
    try {
      const remember = form.getFieldValue('remember');
      const remember = form.getFieldValue("remember");
      const data = { ...response, remember };
      const res = await loginWithGoogle(data);

      if (res.isRegistered) {
        localStorage.setItem('access_token', res.token);
        navigate('/');
        localStorage.setItem("access_token", res.token);
        navigate("/");
      } else {
        navigate('/register-with-google', { state: { user: res.user } });
        navigate("/register-with-google", { state: { user: res.user } });
      }
    } catch (error) {
      showNotification(error.response.data.message);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
        <Card
          style={{
            width: 400,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 className={'font-body text-4xl font-bold text-center mb-5'}>
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
                  message: 'Please input your username!',
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
                  message: 'Please input your password!',
                  message: "Please input your password!",
                },
                {
                  min: 5,
                  message: 'Password must be at least 5 characters!',
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
                  onClick={() => navigate('/forgot-password')}
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
                  backgroundColor: '#40BFFF',
                  borderColor: '#40BFFF',
                  color: '#fff',
                  backgroundColor: "#40BFFF",
                  borderColor: "#40BFFF",
                  color: "#fff",
                  padding: 20,
                }}
                htmlType="submit"
                block
              >
                Login
              </Button>
            </Form.Item>
            <Form.Item>
              <GoogleLogin
                onSuccess={loginWithGoogleHandler}
                onError={() => {
                  console.log('error');
                  console.log("error");
                }}
              />
            </Form.Item>
          </Form>
          <p className="text-center">
            <span
              className="text-blue-500 cursor-pointer"
            >
              Register
            </span>
          </p>
        </Card>
      </div>
    </>
  );
}

export default Login;
