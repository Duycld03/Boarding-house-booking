import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";

function CreateBoardingHouseType({
    visible,
    onClose,
    onSubmit,
    isEdit = false,
    initialValues = {},
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [visible, form, initialValues]);

    const handleFinish = async (values) => {
        try {
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            message.error("Failed to save boarding house type.");
        }
    };

    return (
        <Modal
            title={
                <span className="font-bold text-3xl">
                    Add Boarding House Type
                </span>
            }
            visible={visible}
            footer={null}
            onCancel={onClose}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                        { required: true, message: "Please enter the name." },
                        { max: 50, message: "Name cannot exceed 50 characters." },
                    ]}
                >
                    <Input placeholder="Enter boarding house type name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                        { required: true, message: "Please enter the description." },
                        { max: 200, message: "Description cannot exceed 200 characters." },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Enter description (max 200 characters)"
                        rows={4}
                    />
                </Form.Item>
                <div className="flex justify-end">
                    <Button
                        className="bg-orange-600 text-white"
                        size="large"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary text-white ml-2"
                        size="large"
                        onClick={() => form.submit()}
                    >
                        Submit
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default CreateBoardingHouseType;