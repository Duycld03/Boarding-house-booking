import { Modal, Input, Button, Form, Select } from 'antd';
import { useState } from 'react';
import { toast } from 'react-toastify';
import convertTimetap from '../../utils/convertTimetap';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/themeContext';
import './FormReplayPopup.module.css';

const { Option } = Select;

const FormReplayPopup = ({ visible, onClose, onSubmit, reportData }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation('reviewReportManagement');
  const { darkMode } = useTheme();

  const darkInputStyle = darkMode
    ? {
        backgroundColor: '#374151',
        color: '#fff',
        borderColor: '#4b5563',
      }
    : {};

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue();
      setLoading(true);
      await onSubmit(formData);
      toast.success(
        t('messages.replaySuccess', 'Replay submitted successfully!')
      );
      form.resetFields();
      onClose();
    } catch (error) {
      toast.error(
        t('messages.replayFailed', 'Failed to submit replay. Please try again.')
      );
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('modals.replayTitle', 'Replay to Report')}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
      className={darkMode ? 'dark-modal' : ''}
      bodyStyle={{
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }}
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
          updatedAt: reportData?.updatedAt
            ? convertTimetap(reportData.updatedAt)
            : 'N/A',
        }}
      >
        <Form.Item label={t('columns.reporter')} name="reporter">
          <Input disabled style={darkInputStyle} />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled style={darkInputStyle} />
        </Form.Item>
        <Form.Item
          label={t('columns.status')}
          name="status"
          rules={[
            {
              required: true,
              message: t(
                'filters.errors.statusRequired',
                'Please select a status.'
              ),
            },
          ]}
        >
          {reportData?.status === 'pending' ? (
            <Select
              placeholder={t('filters.statusPlaceholder')}
              className={darkMode ? 'dark-select' : ''}
              popupClassName={darkMode ? 'dark-select-dropdown' : ''}
            >
              {' '}
              <Option value="pending">{t('status.pending')}</Option>
              <Option value="rejected">{t('status.rejected')}</Option>
              <Option value="resolved">{t('status.resolved')}</Option>
            </Select>
          ) : (
            <Input
              disabled
              value={t(`status.${reportData?.status}`, reportData?.status)}
              style={darkInputStyle}
            />
          )}
        </Form.Item>

        <Form.Item label={t('detail.reportedAt')} name="createdAt">
          <Input disabled style={darkInputStyle} />
        </Form.Item>
        <Form.Item label={t('detail.updatedAt')} name="updatedAt">
          <Input disabled style={darkInputStyle} />
        </Form.Item>
        <Form.Item
          label={t('detail.details')}
          name="detailReport"
          rules={[
            {
              required: true,
              message: t('messages.detailRequired', 'Please provide details.'),
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t(
              'detail.detailPlaceholder',
              'E.g., Reason for decision or comments...'
            )}
            style={darkInputStyle}
          />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>{t('buttons.cancel', 'Cancel')}</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {t('buttons.submit', 'Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default FormReplayPopup;
