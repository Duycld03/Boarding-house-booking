import { useState } from "react";
import { Form, Select, Modal, Input, ConfigProvider } from "antd";
import { Button } from "../../../../component";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/themeContext";
import Style from "./AddAccountModal.module.css"; // Import custom CSS for additional dark mode fixes
import classNames from "classnames";
const cx = classNames.bind(Style);

const { Option } = Select;

const AddAccountModal = ({ onAddData }) => {
  const { t } = useTranslation("accountManagement");
  const { darkMode } = useTheme();

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [form1Data, setForm1Data] = useState({});

  // Theme-specific styles

  // Modal styles for dark mode
  const modalStyles = darkMode
    ? {
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
        content: {
          backgroundColor: "#1f2937",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        header: {
          backgroundColor: "#1f2937",
          color: "#ffffff", // Brighter white for better visibility
          borderBottom: "1px solid #374151",
        },
        body: {
          backgroundColor: "#1f2937",
          color: "#ffffff", // Brighter white for better visibility
        },
        footer: {
          backgroundColor: "#1f2937",
          borderTop: "1px solid #374151",
        },
      }
    : {};

  // Form styles for dark mode
  const formStyles = {
    item: darkMode ? { marginBottom: "24px" } : {},
    input: darkMode
      ? {
          backgroundColor: "#374151",
          borderColor: "#4B5563",
          color: "#F9FAFB",
        }
      : {},
    select: darkMode
      ? {
          backgroundColor: "#374151",
          color: "#F9FAFB",
        }
      : {},
    option: darkMode
      ? {
          backgroundColor: "#374151",
          color: "#F9FAFB",
          "&:hover": {
            backgroundColor: "#4B5563",
          },
        }
      : {},
  };

  // Button styles based on theme
  const primaryButtonClass = cx("bg-primary", "w-full", "text-white");
  const secondaryButtonClass = cx("bg-gray-300", {
    "dark:bg-gray-600": darkMode,
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form1.resetFields();
    form2.resetFields();
    setIsModalVisible(false);
    setStep(1);
    setForm1Data({});
  };

  const handleNext = () => {
    form1
      .validateFields()
      .then((values) => {
        setForm1Data(values);
        setStep(2);
      })
      .catch(() => {
        toast.error(t("errors.form1"));
      });
  };

  // Thay đổi hàm handleSubmit để chỉ validate form2
  const handleSubmit = () => {
    form2
      .validateFields()
      .then((values2) => {
        const { confirmPassword, ...accountData } = values2;

        const finalValues = {
          ...form1Data,
          ...accountData,
        };

        onAddData(finalValues);

        handleCancel();
      })
      .catch((error) => {
        console.error("Form 2 validation failed:", error);
        toast.error(t("errors.form2"));
      });
  };

  // Enhanced theme config with proper input field styling for dark mode
  const themeConfig = {
    algorithm: darkMode
      ? ConfigProvider.darkAlgorithm
      : ConfigProvider.defaultAlgorithm,
    token: darkMode
      ? {
          colorText: "#ffffff", // Brighter text for better visibility
          colorTextSecondary: "#e5e7eb", // Less faded secondary text
          colorBgContainer: "#1f2937", // Dark background
          colorBorder: "#4b5563", // More visible borders
          colorPrimary: "#3b82f6", // Blue primary color

          // Form input colors
          colorBgElevated: "#374151", // Dropdown menus, popover backgrounds
          colorFillSecondary: "#374151", // Secondary fill color (select, etc)
          controlItemBgActive: "#3b82f6", // Active item background
          controlItemBgHover: "#4B5563", // Hover state background

          // Input colors
          colorTextPlaceholder: "#9CA3AF", // Placeholder text
          colorTextQuaternary: "#D1D5DB", // Form labels
          colorBorderSecondary: "#4B5563", // Secondary borders
        }
      : {},
    components: {
      Select: darkMode
        ? {
            optionSelectedBg: "#2563eb",
            optionSelectedColor: "#ffffff",
            optionActiveBg: "#3b82f6",
            selectorBg: "#374151",
            colorBgElevated: "#374151",
            colorText: "#F9FAFB",
            colorTextPlaceholder: "#9CA3AF",
            colorBorder: "#4B5563",
            colorPrimaryHover: "#3b82f6",
            borderRadius: 4,
            controlOutline: "rgba(59, 130, 246, 0.5)",
          }
        : {},
      Input: darkMode
        ? {
            colorBgContainer: "#374151",
            colorText: "#F9FAFB",
            colorTextPlaceholder: "#9CA3AF",
            colorBorder: "#4B5563",
            activeBorderColor: "#3b82f6",
            hoverBorderColor: "#60A5FA",
            addonBg: "#374151",
          }
        : {},
      Form: darkMode
        ? {
            labelColor: "#F9FAFB",
            colorText: "#F9FAFB",
          }
        : {},
    },
  };

  // Custom CSS class for input fields in dark mode
  const darkModeInputClass = cx({ "dark-mode-input": darkMode });
  const darkModeSelectClass = cx({ "dark-mode-select": darkMode });

  return (
    <ConfigProvider theme={themeConfig}>
      <Button
        btnAdd
        title={t("buttons.addNew")}
        size="large"
        onClick={showModal}
      />

      <Modal
        title={
          <span className={cx({ "text-white font-medium": darkMode })}>
            {t("modals.createAccount.title")}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        styles={modalStyles}
        className={darkMode ? "ant-modal-dark" : ""}
      >
        <div className={cx({ "dark-mode-form": darkMode })}>
          {step === 1 && (
            <Form form={form1} layout="vertical" name="personal_info">
              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.fullname.label")}
                  </span>
                }
                name="fullname"
                rules={[
                  { required: true, message: t("forms.fullname.required") },
                  {
                    pattern: /^[a-zA-Z\s]+$/,
                    message: t("forms.fullname.invalidFormat"),
                  },
                ]}
                style={formStyles.item}
              >
                <Input
                  placeholder={t("forms.fullname.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.email.label")}
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: t("forms.email.required") },
                  { type: "email", message: t("forms.email.invalidFormat") },
                ]}
                style={formStyles.item}
              >
                <Input
                  placeholder={t("forms.email.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.gender.label")}
                  </span>
                }
                name="gender"
                rules={[
                  { required: true, message: t("forms.gender.required") },
                ]}
                style={formStyles.item}
              >
                <Select
                  placeholder={t("forms.gender.placeholder")}
                  className={darkModeSelectClass}
                  dropdownStyle={darkMode ? { backgroundColor: "#374151" } : {}}
                  popupClassName={cx({ "dark-mode-dropdown": darkMode })}
                >
                  <Option value="male">{t("forms.gender.options.male")}</Option>
                  <Option value="female">
                    {t("forms.gender.options.female")}
                  </Option>
                  <Option value="other">
                    {t("forms.gender.options.other")}
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.phoneNumber.label")}
                  </span>
                }
                name="phoneNumber"
                rules={[
                  { required: true, message: t("forms.phoneNumber.required") },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: t("forms.phoneNumber.invalidFormat"),
                  },
                ]}
                style={formStyles.item}
              >
                <Input
                  placeholder={t("forms.phoneNumber.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Button
                className={primaryButtonClass}
                size="large"
                onClick={handleNext}
                title={t("buttons.next")}
              >
                {t("buttons.next")}
              </Button>
            </Form>
          )}

          {step === 2 && (
            <Form form={form2} layout="vertical" name="account_info">
              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.username.label")}
                  </span>
                }
                name="username"
                rules={[
                  { required: true, message: t("forms.username.required") },
                ]}
                style={formStyles.item}
              >
                <Input
                  placeholder={t("forms.username.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.password.label")}
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: t("forms.password.required") },
                  { min: 6, message: t("forms.password.minLength") },
                ]}
                style={formStyles.item}
              >
                <Input.Password
                  placeholder={t("forms.password.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.confirmPassword.label")}
                  </span>
                }
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: t("forms.confirmPassword.required"),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(t("forms.confirmPassword.mismatch"))
                      );
                    },
                  }),
                ]}
                style={formStyles.item}
              >
                <Input.Password
                  placeholder={t("forms.confirmPassword.placeholder")}
                  className={darkModeInputClass}
                  style={formStyles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cx({ "text-white": darkMode })}>
                    {t("forms.role.label")}
                  </span>
                }
                name="role"
                rules={[{ required: true, message: t("forms.role.required") }]}
                style={formStyles.item}
              >
                <Select
                  placeholder={t("forms.role.placeholder")}
                  className={darkModeSelectClass}
                  dropdownStyle={darkMode ? { backgroundColor: "#374151" } : {}}
                  popupClassName={cx({ "dark-mode-dropdown": darkMode })}
                >
                  <Option value="user">{t("forms.role.options.user")}</Option>
                  <Option value="owner">{t("forms.role.options.owner")}</Option>
                </Select>
              </Form.Item>

              <div className={cx("flex", "justify-between")}>
                <Button
                  className={secondaryButtonClass}
                  size="large"
                  onClick={() => setStep(1)}
                  title={t("buttons.back")}
                >
                  {t("buttons.back")}
                </Button>
                <Button
                  className={primaryButtonClass}
                  size="large"
                  onClick={handleSubmit}
                  title={t("buttons.submit")}
                >
                  {t("buttons.submit")}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default AddAccountModal;
