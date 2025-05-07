import { useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { Button } from "@/component";
import { toast } from "react-toastify";

const { Option } = Select;

const AddFacilities = ({ onAddFacility }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onAddFacility(values);
        handleCancel();
      })
      .catch(() => {
        toast.error("Please correct the errors in the form.");
      });
  };

  return (
    <>
      <Button btnAdd title="Add Facility" size="large" onClick={showModal} />
      <Modal
        title="Add New Facility"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="facility_form">
          <Form.Item
            label="Facility Name"
            name="name"
            rules={[{ required: true, message: "Facility name is required" }]}
          >
            <Input placeholder="Enter facility name" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter facility description" />
          </Form.Item>
          <Button
            className="bg-primary w-full text-white"
            size="large"
            onClick={handleSubmit}
            title="Submit"
          />
        </Form>
      </Modal>
    </>
  );
};

export default AddFacilities;
