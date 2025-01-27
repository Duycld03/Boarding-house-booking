import { Form, Button, Card, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../../../api/authManagement";
import { changePassword } from "../../../api/AccountManagement";
import { Back } from "../../../component";

function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await changePassword(values);

      localStorage.setItem("access_token", res.token);
      toast.success(res.message);
      navigate("/");
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
      toast.error(error?.response?.data?.message);
      navigate("/");
    }
  };

  useEffect(() => {
    checkUser();
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
          Change Password
        </h2>
        <Form
          form={form}
          name="changePassword"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              {
                required: true,
                message: "Please input your old password!",
              },
              {
                min: 5,
                message: "Old password must be at least 5 characters!",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your old password"
              autoComplete="old-password"
            />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Please input your new password!",
              },
              {
                min: 5,
                message: "New password must be at least 5 characters!",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
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
                  if (!value || getFieldValue("newPassword") === value) {
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ChangePassword;
