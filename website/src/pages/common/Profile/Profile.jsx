import classNames from "classnames/bind";
import Styles from "./Profile.module.css";
import { useEffect, useState } from "react";
import { Loader } from "../../../component";
import {
  Form,
  Input,
  Radio,
  Upload,
  Button,
  Card,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import UserAvatar from "../../../assets/images/none_avatar.png";
import { getUser } from "../../../api/authManagement";
import {
  updateAccountFromProfile,
  updateAvatar,
} from "../../../api/AccountManagement";
import { useNavigate } from "react-router-dom";
import ChangeEmailModal from "./ChangeEmailModal";
import { useTheme } from "@/context/ThemeContext";

const { Title, Text } = Typography;
const cx = classNames.bind(Styles);

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

function Profile() {
  const [form] = Form.useForm();
  const [formEmail] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(UserAvatar);
  const [username, setUsername] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [email, setEmail] = useState("");
  const { darkMode } = useTheme();

  const [changeEmailModalVisible, setChangeEmailModalVisible] = useState(false);

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
        color: darkMode ? "#f0f0f0" : "#333",
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const loadProfileForm = (data) => {
    form.setFieldsValue({
      username: data.username,
      fullname: data.fullname,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
    });
  };

  const getUserProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await getUser();
      setAccountBalance(res.accountBalance);

      setImageUrl(res?.avatarImage?.url ?? UserAvatar);

      setUsername(res.username);
      setEmail(res.email);
      setIsOwner(res.role === "owner");

      loadProfileForm(res);
      setProfileLoading(false);
    } catch (error) {
      setProfileLoading(false);
      toast.error("Failed to get user profile!");
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await updateAccountFromProfile(values);
      getUserProfile();
      setLoading(false);
      toast.success(res.message);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await updateAvatar(formData);

      toast.success(res.message);
      onSuccess();
      setLoading(false);
    } catch (error) {
      toast.error("Upload avatar failed!");
      onError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const cardStyle = {
    background: darkMode ? "#1f1f1f" : "#fff",
    boxShadow: darkMode
      ? "0 4px 12px rgba(0, 0, 0, 0.4)"
      : "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    border: darkMode ? "1px solid #333" : "1px solid #eaeaea",
    transition: "all 0.3s ease",
  };

  return (
    <div
      className={`txt transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {profileLoading ? (
        <Loader />
      ) : (
        <div className="container py-8 px-4 mx-auto max-w-full lg:px-10 xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Header - Left Side */}
            <div className="lg:col-span-3">
              <Card
                style={cardStyle}
                className="overflow-hidden"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex flex-col items-center">
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader mb-4"
                    showUploadList={false}
                    customRequest={handleUpload}
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                  >
                    {imageUrl ? (
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt="avatar"
                          className="w-28 h-28 rounded-full object-cover"
                        />
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <EditOutlined className="text-white text-lg" />
                        </div>
                      </div>
                    ) : (
                      uploadButton
                    )}
                  </Upload>

                  <Title
                    level={3}
                    className={`m-0 text-center ${
                      darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    @{username}
                  </Title>

                  {isOwner && (
                    <div
                      className={`mt-4 p-4 rounded-lg text-center ${
                        darkMode ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <Text
                        strong
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        Account Balance
                      </Text>
                      <div
                        className={`text-xl font-bold mt-2 ${
                          darkMode ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(accountBalance)}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Main Profile Content - Right Side */}
            <div className="lg:col-span-9">
              <Card
                style={cardStyle}
                className="overflow-hidden"
                bodyStyle={{ padding: "28px" }}
              >
                {/* Account Information Section */}
                <div className="mb-8">
                  <Title
                    level={4}
                    className={`mb-6 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Account Information
                  </Title>

                  <Form form={formEmail} layout="vertical" className="mb-4">
                    <Form.Item
                      label={
                        <span
                          className={`text-base ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <MailOutlined className="mr-2" />
                          Email Address
                        </span>
                      }
                      name="email"
                      initialValue={email}
                    >
                      <div className="flex items-end gap-4 flex-col md:flex-row">
                        <Input
                          size="large"
                          placeholder="Enter your email"
                          name="email"
                          value={email}
                          disabled
                          className={
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-300"
                              : ""
                          }
                          style={{ flexGrow: 1 }}
                        />
                        <Button
                          name="change-email"
                          type="primary"
                          size="large"
                          onClick={() => setChangeEmailModalVisible(true)}
                          loading={loading}
                          icon={<EditOutlined />}
                        >
                          Change Email
                        </Button>
                      </div>
                    </Form.Item>
                  </Form>
                </div>

                <Divider
                  className={darkMode ? "border-gray-700" : "border-gray-200"}
                />

                {/* Personal Information Section */}
                <div>
                  <Title
                    level={4}
                    className={`mb-6 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Personal Information
                  </Title>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className={darkMode ? "dark-form" : ""}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span
                            className={`text-base ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <UserOutlined className="mr-2" />
                            Full Name
                          </span>
                        }
                        name="fullname"
                        rules={[
                          {
                            required: true,
                            message: "Please input your fullname!",
                          },
                        ]}
                      >
                        <Input
                          size="large"
                          placeholder="Enter your fullname"
                          className={
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-300"
                              : ""
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span
                            className={`text-base ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <PhoneOutlined className="mr-2" />
                            Phone Number
                          </span>
                        }
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
                          className={
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-300"
                              : ""
                          }
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      label={
                        <span
                          className={`text-base ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Gender
                        </span>
                      }
                      name="gender"
                    >
                      <Radio.Group className={darkMode ? "text-gray-300" : ""}>
                        <Radio value="male">Male</Radio>
                        <Radio value="female">Female</Radio>
                        <Radio value="other">Other</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item className="mt-8">
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        icon={<EditOutlined />}
                        className="min-w-40"
                      >
                        Save Changes
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
      <ChangeEmailModal
        isOpen={changeEmailModalVisible}
        setToggleModal={setChangeEmailModalVisible}
        email={email}
      />
    </div>
  );
}

export default Profile;
