import { Modal, Input, Button, Form, Select } from 'antd';
import { useState } from 'react';
import { toast } from 'react-toastify';
import convertTimetap from '../../utils/convertTimetap';

const { Option } = Select;

const FormReplayPopup = ({ visible, onClose, onSubmit, reportData }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue();
      setLoading(true);
      await onSubmit(formData); // Send data to server
      toast.success('Replay submitted successfully!');
      form.resetFields();
      onClose();
    } catch (error) {
      toast.error('Failed to submit replay. Please try again.');
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Replay to Report"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          reporter: reportData?.reporter?.fullname || 'N/A',
          email: reportData?.reporter?.email || 'N/A',
          status: reportData?.status || 'N/A',
          createdAt: reportData?.createdAt
            ? convertTimetap(reportData.createdAt)
            : 'N/A',
          processedBy: reportData?.processedBy?.fullname || 'N/A',
          updatedAt: reportData?.updatedAt
            ? convertTimetap(reportData.updatedAt)
            : 'N/A',
        }}
      >
        <Form.Item label="Reporter" name="reporter">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select a status.' }]}
        >
          {reportData?.status === 'pending' ? (
            <Select placeholder="Select status">
              <Option value="rejected">Rejected</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          ) : (
            <Input disabled value={reportData?.status} />
          )}
        </Form.Item>
        <Form.Item label="Created At" name="createdAt">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Processed By" name="processedBy">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Updated At" name="updatedAt">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Detail Report"
          name="detailReport"
          rules={[{ required: true, message: 'Please provide details.' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="E.g., Reason for decision or comments..."
          />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default FormReplayPopup;
