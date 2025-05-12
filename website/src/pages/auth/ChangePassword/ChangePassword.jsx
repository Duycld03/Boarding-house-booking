import { Form, Button, Card, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../../../api/authManagement";
import { changePassword } from "../../../api/AccountManagement";
import { Back } from "../../../component";
import { useTheme } from "../../../context/themeContext";
import { useTranslation } from "react-i18next";

function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useTranslation("changePassword");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await changePassword(values);

      localStorage.setItem("access_token", res.token);
      toast.success(t("message.success"));
      navigate("/");
      setLoading(false);
    } catch (error) {
      toast.error(t("message.error"));
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
    <div
      className={`flex justify-center items-center h-screen ${
        darkMode ? "bg-background-dark" : "bg-[#f0f2f5]"
      }`}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        }}
        className={darkMode ? "dark:border-gray-700" : ""}
      >
        <p className="mb-5">
          <Back />
        </p>
        <h2
          className={` text-4xl font-bold text-center mb-5 ${
            darkMode ? "text-text-dark" : "text-text-light"
          }`}
        >
          {t("changePassword.title")}
        </h2>
        <Form
          form={form}
          name="changePassword"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className={darkMode ? "dark-form" : ""}
        >
          <Form.Item
            label={
              <span className={darkMode ? "text-text-dark" : "text-text-light"}>
                {t("changePassword.oldPassword.label")}
              </span>
            }
            name="oldPassword"
            rules={[
              {
                required: true,
                message: t("changePassword.oldPassword.required"),
              },
              {
                min: 5,
                message: t("changePassword.oldPassword.minLength"),
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder={t("changePassword.oldPassword.placeholder")}
              autoComplete="old-password"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className={darkMode ? "text-text-dark" : "text-text-light"}>
                {t("changePassword.newPassword.label")}
              </span>
            }
            name="newPassword"
            rules={[
              {
                required: true,
                message: t("changePassword.newPassword.required"),
              },
              {
                min: 5,
                message: t("changePassword.newPassword.minLength"),
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder={t("changePassword.newPassword.placeholder")}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className={darkMode ? "text-text-dark" : "text-text-light"}>
                {t("changePassword.confirmPassword.label")}
              </span>
            }
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: t("changePassword.confirmPassword.required"),
              },
              {
                min: 5,
                message: t("changePassword.confirmPassword.minLength"),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("changePassword.confirmPassword.notMatch"))
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder={t("changePassword.confirmPassword.placeholder")}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={
                darkMode ? "bg-blue-400 hover:bg-blue-700 border-blue-600" : ""
              }
            >
              {t("changePassword.submitButton")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ChangePassword;
