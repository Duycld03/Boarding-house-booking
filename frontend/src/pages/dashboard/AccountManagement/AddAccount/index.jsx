import { useState } from "react";
import { Form, Select, Modal, Input } from "antd";
import { Button } from "../../../../component";
import { toast } from "react-toastify";

import { createAccount } from "../../../../api/AccountManagement";

const { Option } = Select;

const AddAccountModal = ({ onAddData }) => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [form1Data, setForm1Data] = useState({}); // State to store Form 1 data

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
        setForm1Data(values); // Save Form 1 data
        setStep(2);
      })
      .catch(() => {
        toast.error("Please correct the errors in form 1.");
      });
  };

  const handleSubmit = () => {
    form1
      .validateFields()
      .then((values1) => {
        form2
          .validateFields()
          .then((values2) => {
            const { confirmPassword, ...accountData } = values2; // Loại bỏ confirmPassword

            const finalValues = {
              ...form1Data,
              ...accountData,
            };

            onAddData(finalValues);
            handleCancel();

            createAccount(finalValues)
              .then((res) => {
                console.log("data: ", res);

                // updateParentState();
                handleCancel();
                toast.success("Account created successfully!");
              })
              .catch((error) => {
                if (error.response) {
                  toast.error(error.response.data.error);
                }
              });
          })
          .catch((error) => {
            console.error("Form 2 validation failed:", error); // In lỗi form2
            toast.error("Please correct the errors in form 2.");
          });
      })
      .catch((error) => {
        console.error("Form 1 validation failed:", error); // In lỗi form1
        toast.error("Please correct the errors in form 1.");
      });
  };

  return (
    <>
      <Button btnAdd title="Add new" size="large" onClick={showModal}></Button>
      <Modal
        title="Create Account"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        {step === 1 && (
          <Form form={form1} layout="vertical" name="personal_info">
            <Form.Item
              label="Enter your full name"
              name="fullname"
              rules={[
                { required: true, message: "Full Name is required" },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message:
                    "Full Name cannot contain numbers or special characters",
                },
              ]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>
            <Form.Item
              label="Enter your email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email address" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              label="Select your gender"
              name="gender"
              rules={[{ required: true, message: "Gender is required" }]}
            >
              <Select placeholder="Select Gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Enter your phone number"
              name="phoneNumber"
              rules={[
                { required: true, message: "Phone Number is required" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Invalid phone number format",
                },
              ]}
            >
              <Input placeholder="Phone Number" />
            </Form.Item>
            <Button
              className="bg-primary w-full text-white"
              size="large"
              onClick={handleNext}
              title="Next"
            >
              Next
            </Button>
          </Form>
        )}
        {step === 2 && (
          <Form form={form2} layout="vertical" name="account_info">
            <Form.Item
              label="Enter your username"
              name="username"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Enter your password"
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item
              label="Enter confirm password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Confirm Password is required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item
              label="Select role"
              name="role"
              rules={[{ required: true, message: "Role is required" }]}
            >
              <Select placeholder="Select Role">
                <Option value="user">User</Option>
                <Option value="owner">Owner</Option>
              </Select>
            </Form.Item>
            <div className="flex justify-between">
              <Button
                className="bg-gray-300"
                size="large"
                onClick={() => setStep(1)}
                title="Back"
              >
                Back
              </Button>
              <Button
                className="bg-primary w-full text-white"
                size="large"
                onClick={handleSubmit}
                title="Submit"
              >
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default AddAccountModal;
