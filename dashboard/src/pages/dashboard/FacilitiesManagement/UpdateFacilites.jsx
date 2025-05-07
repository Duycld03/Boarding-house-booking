import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

function UpFacilities({ isOpen, onClose, facility, onUpdate }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (facility) {
      form.setFieldsValue({
        name: facility.name,
        description: facility.description,
      });
    }
  }, [facility, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onUpdate(facility._id, values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Update Facility"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter facility name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpFacilities;
