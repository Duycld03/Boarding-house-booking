import classNames from "classnames/bind";
import Styles from "./Profile.module.css";
import { useEffect, useState } from "react";
import { Loader } from "../../../component";
import { Form, Input, Radio, Upload, Button, Card } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import UserAvatar from "../../../assets/images/none_avatar.png";
import { getUser } from "../../../api/authManagement";
import {
  updateAccountFromProfile,
  updateAvatar,
} from "../../../api/AccountManagement";
import { useNavigate } from "react-router-dom";
import ChangeEmailModal from "./ChangeEmailModal";

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
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [formEmail] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(UserAvatar);
  const [username, setUsername] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [email, setEmail] = useState("");

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

  return (
    <div className="txt">
      {profileLoading ? (
        <Loader />
      ) : (
        <div className="flex justify-between mb-4 flex-col md:w-[60%] mx-auto">
          <Card>
            <div className="flex justify-center items-center flex-col">
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={handleUpload}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="avatar"
                    className="w-36 h-36 rounded-full object-cover"
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
              <p className="text-3xl text-center">@{username}</p>
            </div>
            <Form form={formEmail} layout="vertical">
              {isOwner && (
                <Form.Item label="Account Balance">
                  <div>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(accountBalance)}
                  </div>
                </Form.Item>
              )}
              <Form.Item
                label="Email"
                name="email"
                initialValue={email}
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
                <div className="flex items-end justify-between gap-5">
                  <Input
                    size="large"
                    placeholder="Enter your email"
                    name="email"
                    value={email}
                    disabled
                  />
                  <Button
                    name="change-email"
                    type="primary"
                    size="large"
                    onClick={() => setChangeEmailModalVisible(true)}
                    loading={loading}
                  >
                    Change Email
                  </Button>
                </div>
              </Form.Item>
            </Form>

            <Form form={form} layout="vertical" onFinish={onFinish}>
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
              <Form.Item label="Gender" name="gender">
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Card>
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
