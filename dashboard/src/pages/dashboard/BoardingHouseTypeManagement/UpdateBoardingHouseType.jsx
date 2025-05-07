import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { getBoardingHouseTypeDetails, updateBoardingHouseType } from "../../../api/BoardingHManagement";
import { toast } from "react-toastify";
import { Button } from "../../../component";

function UpdateBoardingHouseType({ visible, onClose, recordId, onSuccess }) {
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchDetails = async () => {
            if (recordId) {
                try {
                    const response = await getBoardingHouseTypeDetails(recordId);
                    form.setFieldsValue(response.data);
                } catch (error) {
                    toast.error("Failed to fetch boarding house type details.");
                }
            } else {
                form.resetFields();
            }
        };

        if (visible) {
            fetchDetails();
        }
    }, [recordId, visible, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (recordId) {
                await updateBoardingHouseType(recordId, values);
                toast.success("Boarding house type updated successfully!");
                onSuccess();
                onClose();
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <span className="font-bold text-3xl">
                    Update Boarding House Type
                </span>
            }
            visible={visible}
            footer={null}
            onCancel={handleCancel}
        >
            <Form form={form} layout="vertical">
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
            </Form>
        </Modal>
    );
}

export default UpdateBoardingHouseType;