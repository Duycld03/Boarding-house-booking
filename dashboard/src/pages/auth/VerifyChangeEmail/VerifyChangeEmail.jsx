import { useEffect, useState } from "react";
import { Form, Button, Card, Input } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../../../api/authManagement";
import { Back } from "../../../component";
import { verifyChangeEmail } from "../../../api/AccountManagement";

function VerifyChangeEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const data = {
        ...values,
        email: location?.state?.email,
        token: location?.state?.token,
      };
      const res = await verifyChangeEmail(data);
      toast.success(res.message);
      navigate("/profile");
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
    } catch (error) {
      navigate("/home");
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!location?.state?.email || !location?.state?.token) {
      navigate("/home");
    }
  }, []);

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
          Verify OTP to change email
        </h2>
        <Form
          form={form}
          name="verify-otp"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="OTP"
            name="otp"
            rules={[
              { required: true, message: "Please enter your OTP" },
              {
                pattern: /^\d{6}$/,
                message: "OTP must be 6 digits",
              },
            ]}
          >
            <Input.OTP
              size="large"
              placeholder="Enter your OTP"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Verify
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VerifyChangeEmail;
