import classNames from "classnames/bind";
import Styles from "./Profile.module.css";
import { useEffect, useState } from "react";
import { Loader } from "../../../component";
import { Form, Input, Radio, Avatar, Upload, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import UserAvatar from "../../../assets/images/none_avatar.png";
import { getUser } from "../../../api/authManagement";
import { updateAccountFromProfile } from "../../../api/AccountManagement";

const cx = classNames.bind(Styles);

function Profile() {
  const [form] = Form.useForm();
  const [formEmail] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(UserAvatar);
  const [username, setUsername] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [email, setEmail] = useState("");

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
      toast.success("Avatar updated successfully!");
    }
  };

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
      setAvatar(res.avatar || UserAvatar);
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

  const onEmailFinish = async (values) => {
    console.log(values);
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <div className="txt">
      {profileLoading ? (
        <Loader />
      ) : (
        <div className="flex justify-between mb-4 flex-col md:w-[50%] mx-auto">
          <div className="flex justify-center items-center flex-col">
            <Avatar size={100} src={avatar} />
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <p className="text-center text-3xl font-bold">@{username}</p>
              <Button icon={<EditOutlined />} className="mt-5">
                Change Avatar
              </Button>
            </Upload>
          </div>
          <Form form={formEmail} layout="vertical" onFinish={onEmailFinish}>
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
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  name="change-email"
                  type="primary"
                  size="large"
                  htmlType="submit"
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
                placeholder="Enter your confirm password"
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
        </div>
      )}
    </div>
  );
}
export default Profile;
