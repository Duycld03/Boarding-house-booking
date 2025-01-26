import { useEffect } from "react";
import { Form, Button, Card, Input } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, verifyRegister } from "../../../api/authManagement";
import { toast } from "react-toastify";

function VerifyRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const data = {
        ...values,
        account: location?.state?.account,
        verifyToken: location?.state?.verifyToken,
      };
      const res = await verifyRegister(data);
      localStorage.setItem("access_token", res.token);
      toast.success("Register successful");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message);
      form.resetFields();
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
    if (!location?.state?.account || !location?.state?.verifyToken) {
      navigate("/register");
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
        <h2 className={"font-body text-4xl font-bold text-center mb-5"}>
          Verify OTP
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
            <Button type="primary" htmlType="submit" block>
              Verify
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VerifyRegister;
