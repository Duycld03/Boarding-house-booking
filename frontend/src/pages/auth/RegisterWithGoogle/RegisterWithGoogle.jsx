import { Form, Button, Card, Input, Select, notification } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { register, getUser } from "../../../api/authManagement";

function RegisterWithGoogle() {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const showNotification = (description) => {
    api.error({
      message: "Register Failed",
      description: description || "An unexpected error occurred",
    });
  };
  const onFinish = async (values) => {
    try {
      const res = await register(values);
      localStorage.setItem("access_token", res.token);
      navigate("/");
    } catch (error) {
      showNotification(error.response.data.message);
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

  useEffect(() => {
    if (!location.state.user) {
      return navigate("/");
    }
    const user = location.state.user;
    user.fullname = user.name;
    form.setFieldsValue(user);
  }, []);

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
        <Card
          style={{
            width: 500,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            className={"font-body text-4xl font-bold"}
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            Register With Google
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
              rules={[
                {
                  required: true,
                  message: "Please input your fullname!",
                },
              ]}
            >
              <Input size="large" placeholder="Enter your fullname" />
            </Form.Item>

            <Form.Item
              hidden
              label="Email"
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
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>
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
              <Input
                size="large"
                placeholder="Enter your username"
                autoComplete="username"
              />
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
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
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
              />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
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
                placeholder="Enter your confirm password"
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select size="large" placeholder="Select your gender">
                <Select.Option value="male">male</Select.Option>
                <Select.Option value="female">female</Select.Option>
                <Select.Option value="other">other</Select.Option>
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
                block
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default RegisterWithGoogle;
