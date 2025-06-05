import { Form, Button, Card, Input, Select } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { register, getUser } from "../../../api/authManagement";
import { Back } from "../../../component";
import { useTheme } from "../../../context/themeContext";
import styles from "./RegisterWithGoogle.module.css";

function RegisterWithGoogle() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await register(values);
      localStorage.setItem("access_token", res.token);
      toast.success("Register successful");
      navigate("/");
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
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

  useEffect(() => {
    if (!location?.state?.user) {
      return navigate("/");
    }
    const user = location?.state?.user;
    user.fullname = user.name;
    form.setFieldsValue(user);
  }, []);

  return (
    <div
      className={`${styles.container} ${darkMode ? styles.containerDark : ""}`}
    >
      <Card className={`${styles.card} ${darkMode ? styles.cardDark : ""}`}>
        <p className={styles.backButton}>
          <Back />
        </p>
        <h2 className={`${styles.title} ${darkMode ? styles.titleDark : ""}`}>
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
          className={darkMode ? styles.formDark : ""}
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
              placeholder="Enter your phone number"
            />
          </Form.Item>

          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select size="large" placeholder="Select your gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="submit" wrapperCol={{ offset: 4, span: 16 }}>
            <Button
              className={styles.submitButton}
              htmlType="submit"
              loading={loading}
              block
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default RegisterWithGoogle;
