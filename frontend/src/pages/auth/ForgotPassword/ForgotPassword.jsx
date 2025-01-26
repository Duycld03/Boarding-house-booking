import { Form, Button, Card, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../../api/authManagement";
import { Back } from "../../../component";

function ForgotPassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await forgotPassword(values);
      toast.success(res.message);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
      setLoading(false);
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Email
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ForgotPassword;
