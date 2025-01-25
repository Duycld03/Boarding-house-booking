import { Form, Button, Checkbox, Card, Input, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../../../api/authManagement";

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

      localStorage.setItem("access_token", res.token);

      if (role === "user" || role === "owner") {
        navigate("/");
      } else if (role === "admin") {
        navigate("/dashboard");
      }
    } catch (error) {
      showNotification(error.response.data.message);
      form.resetFields();
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
        <Card
          style={{
            width: 400,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
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
              <Input.Password size="large" placeholder="Enter your password" />
            </Form.Item>

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
                block
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default Login;
