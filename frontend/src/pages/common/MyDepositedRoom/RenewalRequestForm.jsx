import {
  createExtensionRequest,
  updateExtensionRequest,
} from "@/api/extensionRequest";
import { Modal, Form, Input, Button, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { TextArea } = Input;

const RenewalRequestForm = ({
  visible,
  onClose,
  onSubmit,
  renewalData,
  existingRequest,
}) => {
  const [form] = Form.useForm();
  const [requestedEndDate, setRequestedEndDate] = useState(null);

  useEffect(() => {
    if (renewalData?.endDate) {
      setRequestedEndDate(dayjs(renewalData.endDate, "DD/MM/YYYY"));
      form.resetFields();
    }
  }, [renewalData, form]);

  const navigate = useNavigate();

  const handleTimeChange = () => {
    const { duration, timeUnit } = form.getFieldsValue([
      "duration",
      "timeUnit",
    ]);
    if (!renewalData?.endDate || !duration || !timeUnit) return;

    const newEndDate = dayjs(renewalData.endDate, "DD/MM/YYYY").add(
      duration,
      timeUnit
    );

    setRequestedEndDate(newEndDate);
    form.setFieldsValue({
      requestedEndDate: newEndDate.format("DD/MM/YYYY"),
    });
  };

  const handleSubmit = async (values) => {
    if (!requestedEndDate) {
      toast.error("Please select a renewal duration!");
      return;
    }

    try {
      const payload = {
        tenantNote: values.tenantNote,
        depositRoomId: renewalData?._id,
        roomId: renewalData?.roomId,
        currentEndDate: dayjs(renewalData?.endDate, "DD/MM/YYYY").format(
          "YYYY-MM-DD"
        ),
        requestedEndDate: requestedEndDate.format("YYYY-MM-DD"),
      };

      const checkExistedRequest = existingRequest?.find((request) => {
        return request?.roomId?._id?.toString() === payload?.roomId?.toString();
      });

      if (checkExistedRequest) {
        Modal.confirm({
          title: "Existing Renewal Request",
          content:
            "A renewal request already exists for this room. Do you want to update it?",
          okText: "Update",
          cancelText: "Cancel",
          onOk: async () => {
            await updateExtensionRequest(checkExistedRequest._id, payload);
            toast.success("Renewal request updated successfully!");
            form.resetFields();
            setRequestedEndDate(null);
            onClose();
          },
          onCancel: () => {
            toast.info("No changes were made.");
          },
        });
      } else {
        await createExtensionRequest(payload);
        toast.success("Renewal request submitted successfully!");
        form.resetFields();
        setRequestedEndDate(null);
        onClose();
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("An error occurred. Please try again!");
    }
  };

  return (
    <Modal
      title="Request Lease Renewal"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div>
        <strong>Boarding House Name:</strong>
        <p>{renewalData?.name || "N/A"}</p>
      </div>

      <div>
        <strong>Room Number:</strong>
        <p>{renewalData?.roomNumber || "N/A"}</p>
      </div>

      <div>
        <strong>Current Lease End Date:</strong>
        <p>{renewalData?.endDate || "N/A"}</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          duration: 0,
          timeUnit: "month",
          tenantNote: renewalData?.tenantNote || "",
        }}
        onFinish={handleSubmit}
      >
        <Form.Item label="Renewal Duration" required>
          <Input.Group compact>
            <Form.Item
              name="duration"
              rules={[{ required: true, message: "Enter duration!" }]}
              noStyle
            >
              <Input
                type="number"
                min={1}
                onChange={handleTimeChange}
                style={{ width: "50%" }}
              />
            </Form.Item>

            <Form.Item
              name="timeUnit"
              rules={[{ required: true, message: "Select time unit!" }]}
              noStyle
            >
              <Select style={{ width: "50%" }} onChange={handleTimeChange}>
                <Select.Option value="month">Months</Select.Option>
                <Select.Option value="year">Years</Select.Option>
              </Select>
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item label="Requested End Date">
          <Input
            value={
              requestedEndDate ? requestedEndDate.format("DD/MM/YYYY") : ""
            }
            readOnly
          />
        </Form.Item>

        <Form.Item label="Notes (Optional)" name="tenantNote">
          <TextArea rows={3} placeholder="Enter your note..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!requestedEndDate}>
            Submit Request
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenewalRequestForm;
