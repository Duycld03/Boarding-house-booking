import { useEffect, useState } from "react";
import { Form, Select, Modal, Input, DatePicker, Tag, Avatar } from "antd";
import { Button, ConfirmModal } from "../../../../component";
import { toast } from "react-toastify";
import moment from "moment";
import formatAmount from "../../../../utils/formatAmount";

const { Option } = Select;

const UpdateAccountModal = ({ accountData, onUpdate, onDelete }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

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

  const handleOnOkDelete = () => {
    onDelete(accountData?._id);
    setIsModalVisible(false);
    handleToggleMobal();
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

  //on delete:
  const handleToggleMobal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Modal
        title="Update Account"
        open={isModalVisible}
        onCancel={handleCancel}
        className="relative z-10"
        footer={null}
        destroyOnClose
      >
        <div
          className="absolute top-[-5%]
        rounded-full
        border-sky-600
        border-2
        left-1/2 transform -translate-x-1/2"
        >
          <Avatar
            src={`http://localhost:3000/${accountData?.avatarImage}`}
            alt="Avatar"
            size="large"
            shape="circle"
            className="w-40 h-40"
          />
        </div>

        <Form form={form} layout="vertical" name="update_account">
          <Form.Item label="Username" name="username">
            <Input placeholder="Username" disabled />
          </Form.Item>

          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Password" disabled />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input placeholder="Email" disabled />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Invalid phone number format",
              },
              {
                required: true,
                message: "Phone number must required", // Thông báo lỗi nếu không có giá trị
              },
            ]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="fullname"
            rules={[
              {
                required: true,
                message: "Full name is required", // Thông báo lỗi nếu không có giá trị
              },
              {
                pattern: /^[a-zA-Z\s]+$/, // Chỉ cho phép chữ cái và khoảng trắng
                message:
                  "Full name cannot contain numbers or special characters", // Thông báo lỗi nếu không hợp lệ
              },
            ]}
          >
            <Input placeholder="Full Name" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select placeholder="Select Gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Select placeholder="Select Role">
              <Option value="user">User</Option>
              <Option value="owner">Owner</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Created At" name="createdAt">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Creation Date"
              disabled
            />
          </Form.Item>

          <Form.Item label="Updated At" name="updatedAt">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Last Updated Date"
              disabled
            />
          </Form.Item>

          {accountData?.role === "owner" && (
            <Form.Item label="Account Balance" name={"accountBalance"}>
              <div>{formatAmount(accountData?.accountBalance) + " VND"}</div>
            </Form.Item>
          )}

          <Form.Item label="Status" name={"status"}>
            <div>
              {accountData?.status === "active" && (
                <Tag color="green">Active</Tag>
              )}
              {accountData?.status === "inactive" && (
                <Tag color="orange">Inactive</Tag>
              )}
              {accountData?.status === "đã khóa" && (
                <Tag color="red">locked</Tag>
              )}
            </div>
          </Form.Item>

          <div className="flex justify-between">
            <Button
              title={"Delete"}
              btnDelete
              onClick={handleOnOkDelete}
              size="large"
            />
            <div className="flex">
              <Button
                className="bg-orange-600 text-white"
                size="large"
                onClick={handleCancel}
                title="Cancel"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary text-white ml-2"
                size="large"
                onClick={handleSubmit}
                title="Update"
              >
                Update
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateAccountModal;
