import { useEffect, useState } from "react";
import {
  Form,
  Select,
  Modal,
  Input,
  DatePicker,
  Tag,
  Avatar,
  ConfigProvider,
} from "antd";
import { Button } from "../../../../component";
import { toast } from "react-toastify";
import moment from "moment";
import formatAmount from "../../../../utils/formatAmount";
import DefaultAccount from "../../../../assets/images/none_avatar.png";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import Styles from "./UpdateAccount.module.css";
import classNames from "classnames";

const cx = classNames.bind(Styles);

const { Option } = Select;

const UpdateAccountModal = ({ accountData, onUpdate }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  console.log("accountData", accountData);

  // Using the theme context for dark mode
  const { darkMode } = useTheme();

  // Using react-i18next for translations
  const { t } = useTranslation("accountManagement");

  useEffect(() => {
    if (accountData) {
      setIsModalVisible(true);
      form.setFieldsValue({
        username: accountData?.username,
        password: accountData?.password,
        email: accountData?.email,
        phoneNumber: accountData?.phoneNumber,
        fullname: accountData?.fullname,
        gender: accountData?.gender,
        role: accountData?.role,
        createdAt: accountData?.createdAt,
        updatedAt: accountData?.updatedAt,
        accountBalance: accountData?.accountBalance,
        status: accountData?.status,
        avatarImage: accountData?.avatarImage,
        deleted: accountData?.deleted,
      });
    }
  }, [accountData, form]);

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const submitValue = {
          ...values,
          deleted: accountData?.deleted,
          avatarImage: accountData?.avatarImage,
          accountBalance: accountData?.accountBalance,
        };

        onUpdate(submitValue);
        handleCancel();
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  form.setFieldsValue({
    createdAt: accountData?.createdAt ? moment(accountData.createdAt) : null,
    updatedAt: accountData?.updatedAt ? moment(accountData.updatedAt) : null,
  });

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
    datePicker: darkMode
      ? {
          backgroundColor: "#374151",
          borderColor: "#4B5563",
          color: "#F9FAFB",
        }
      : {},
  };

  // Custom CSS class for form elements in dark mode
  const darkModeInputClass = cx({
    "dark-mode-input": darkMode,
  });

  const darkModeSelectClass = cx({
    "dark-mode-select": darkMode,
  });

  const darkModeDatePickerClass = cx({
    "dark-mode-datepicker": darkMode,
  });

  // Define modal class based on theme
  const modalClass = cx({
    relative: true,
    "z-10": true,
    "ant-modal-dark": darkMode, // Updated to match the CSS class in your style file
  });

  // Button styles based on theme
  const cancelButtonClass = cx({
    "bg-orange-700": darkMode,
    "bg-orange-600": !darkMode,
    "text-white": true,
  });

  const updateButtonClass = cx({
    "bg-blue-700": darkMode,
    "bg-primary": !darkMode,
    "text-white": true,
    "ml-2": true,
  });

  // Theme config for ConfigProvider
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
      DatePicker: darkMode
        ? {
            colorBgContainer: "#374151",
            colorText: "#F9FAFB",
            colorTextPlaceholder: "#9CA3AF",
            colorBorder: "#4B5563",
            colorPrimaryBorder: "#3b82f6",
            colorPrimaryHover: "#60A5FA",
            colorTextDisabled: "#6B7280",
            colorBgContainerDisabled: "#4B5563",
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

  // Avatar border style
  const avatarBorderClass = cx(
    "absolute",
    "top-[-5%]",
    "rounded-full",
    "border-sky-600",
    "border-2",
    "left-1/2",
    "transform",
    "-translate-x-1/2",
    {
      "dark-avatar-border": darkMode,
    }
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <Modal
        title={
          <span className={darkMode ? "text-white font-medium" : ""}>
            {t("updateAccount.title")}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        className={modalClass}
        styles={modalStyles}
        footer={null}
        destroyOnClose
      >
        <div className={darkMode ? "dark-mode-form" : ""}>
          <div className={avatarBorderClass}>
            <Avatar
              src={accountData?.avatarImage?.url ?? DefaultAccount}
              alt={t("updateAccount.avatar")}
              size="large"
              shape="circle"
              className={cx("w-40", "h-40")}
            />
          </div>

          <Form form={form} layout="vertical" name="update_account">
            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.username")}
                </span>
              }
              name="username"
              style={formStyles.item}
            >
              <Input
                placeholder={t("updateAccount.usernamePlaceholder")}
                disabled
                className={darkModeInputClass}
                style={formStyles.input}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.password")}
                </span>
              }
              name="password"
              style={formStyles.item}
            >
              <Input.Password
                placeholder={t("updateAccount.passwordPlaceholder")}
                disabled
                defaultValue="********" // Thêm dòng này
                className={darkModeInputClass}
                style={formStyles.input}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.email")}
                </span>
              }
              name="email"
              style={formStyles.item}
            >
              <Input
                placeholder={t("updateAccount.emailPlaceholder")}
                disabled
                className={darkModeInputClass}
                style={formStyles.input}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.phoneNumber")}
                </span>
              }
              name="phoneNumber"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: t("updateAccount.invalidPhoneFormat"),
                },
                {
                  required: true,
                  message: t("updateAccount.phoneRequired"),
                },
              ]}
              style={formStyles.item}
            >
              <Input
                placeholder={t("updateAccount.phoneNumberPlaceholder")}
                className={darkModeInputClass}
                style={formStyles.input}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.fullName")}
                </span>
              }
              name="fullname"
              rules={[
                {
                  required: true,
                  message: t("updateAccount.fullNameRequired"),
                },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: t("updateAccount.fullNameInvalid"),
                },
              ]}
              style={formStyles.item}
            >
              <Input
                placeholder={t("updateAccount.fullNamePlaceholder")}
                className={darkModeInputClass}
                style={formStyles.input}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.gender")}
                </span>
              }
              name="gender"
              style={formStyles.item}
            >
              <Select
                placeholder={t("updateAccount.selectGender")}
                className={darkModeSelectClass}
                style={formStyles.select}
                popupClassName={darkMode ? "dark-mode-select-dropdown" : ""}
              >
                <Option value="male">{t("updateAccount.genderMale")}</Option>
                <Option value="female">
                  {t("updateAccount.genderFemale")}
                </Option>
                <Option value="other">{t("updateAccount.genderOther")}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.role")}
                </span>
              }
              name="role"
              style={formStyles.item}
            >
              <Select
                placeholder={t("updateAccount.selectRole")}
                className={darkModeSelectClass}
                style={formStyles.select}
                popupClassName={darkMode ? "dark-mode-select-dropdown" : ""}
              >
                <Option value="user">{t("updateAccount.roleUser")}</Option>
                <Option value="owner">{t("updateAccount.roleOwner")}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.createdAt")}
                </span>
              }
              name="createdAt"
              style={formStyles.item}
            >
              <DatePicker
                style={{ width: "100%", ...formStyles.datePicker }}
                placeholder={t("updateAccount.creationDate")}
                disabled
                className={darkModeDatePickerClass}
                popupClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.updatedAt")}
                </span>
              }
              name="updatedAt"
              style={formStyles.item}
            >
              <DatePicker
                style={{ width: "100%", ...formStyles.datePicker }}
                placeholder={t("updateAccount.lastUpdatedDate")}
                disabled
                className={darkModeDatePickerClass}
                popupClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>

            {accountData?.role === "owner" && (
              <Form.Item
                label={
                  <span className={darkMode ? "text-white" : ""}>
                    {t("updateAccount.accountBalance")}
                  </span>
                }
                name="accountBalance"
                style={formStyles.item}
              >
                <div className={darkMode ? "text-white" : ""}>
                  {formatAmount(accountData?.accountBalance) + " VND"}
                </div>
              </Form.Item>
            )}

            <Form.Item
              label={
                <span className={darkMode ? "text-white" : ""}>
                  {t("updateAccount.status")}
                </span>
              }
              name="status"
              style={formStyles.item}
            >
              <div>
                {accountData?.status === "active" && (
                  <Tag color="green">{t("updateAccount.statusActive")}</Tag>
                )}
                {accountData?.status === "inactive" && (
                  <Tag color="orange">{t("updateAccount.statusInactive")}</Tag>
                )}
                {accountData?.status === "đã khóa" && (
                  <Tag color="red">{t("updateAccount.statusLocked")}</Tag>
                )}
              </div>
            </Form.Item>

            <div className={cx("flex", "justify-end")}>
              <Button
                className={cancelButtonClass}
                size="large"
                onClick={handleCancel}
                title={t("updateAccount.cancel")}
              >
                {t("updateAccount.cancel")}
              </Button>
              <Button
                className={updateButtonClass}
                size="large"
                onClick={handleSubmit}
                title={t("updateAccount.update")}
              >
                {t("updateAccount.update")}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default UpdateAccountModal;
