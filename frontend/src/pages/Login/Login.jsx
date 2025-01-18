import { Form, Button, Checkbox, Card } from "antd";
import CustomInput from "../../component/Input";

function LoginForm() {
  const onFinish = (values) => {
    console.log("Form values:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Form submission failed:", errorInfo);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          className={"font-body text-4xl font-bold"}
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          Login
        </h2>
        <Form
          name="login"
          layout="vertical"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
              {
                type: "email",
                message: "The input is not a valid email!",
              },
            ]}
          >
            <CustomInput size="large" placeholder="Enter your email" />
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
                min: 6,
                message: "Password must be at least 6 characters!",
              },
            ]}
          >
            <CustomInput
              size="large"
              type="password"
              placeholder="Enter your password"
            />
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
  );
}

export default LoginForm;
