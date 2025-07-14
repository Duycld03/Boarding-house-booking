import { useEffect } from 'react';
import { Modal, Form, Input, Select, ConfigProvider } from 'antd';
import { Button as CustomButton } from '@/component';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/themeContext';
import './UpdateStaffModal.css'; // 👈 import CSS riêng cho dark mode

const { Option } = Select;

const UpdateStaffModal = ({ open, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation('staffManagement');
  const { darkMode } = useTheme();

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        fullname: initialData.fullname,
        email: initialData.email,
        gender: initialData.gender,
      });
    }
  }, [initialData, open, form]);

  const handleFinish = (values) => {
    if (initialData?._id) {
      onSubmit?.({ _id: initialData._id, ...values });
    }
  };

  const handleError = () => {
    toast.error(t('errors.form1'));
  };

  return (
    <ConfigProvider>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        destroyOnClose
        title={t('updateAccount.title')}
        className={darkMode ? 'dark-modal' : ''}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onFinishFailed={handleError}
          className={darkMode ? 'dark-form' : ''}
        >
          <Form.Item
            label={t('forms.fullname.label')}
            style={{ marginBottom: 0 }}
            name="fullname"
            rules={[{ required: true, message: t('forms.fullname.required') }]}
          >
            <Input
              placeholder={t('forms.fullname.placeholder')}
              className={darkMode ? 'dark-input' : ''}
            />
          </Form.Item>

          <Form.Item
            label={t('forms.email.label')}
            style={{ marginBottom: 0 }}
            name="email"
            rules={[
              { required: true, message: t('forms.email.required') },
              { type: 'email', message: t('forms.email.invalidFormat') },
            ]}
          >
            <Input
              placeholder={t('forms.email.placeholder')}
              className={darkMode ? 'dark-input' : ''}
            />
          </Form.Item>

          <Form.Item
            label={t('forms.gender.label')}
            style={{ marginBottom: 0 }}
            name="gender"
            rules={[{ required: true, message: t('forms.gender.required') }]}
          >
            <Select
              placeholder={t('forms.gender.placeholder')}
              className={darkMode ? 'dark-select' : ''}
              dropdownClassName={darkMode ? 'dark-dropdown' : ''}
            >
              <Option value="male">{t('forms.gender.options.male')}</Option>
              <Option value="female">{t('forms.gender.options.female')}</Option>
              <Option value="other">{t('forms.gender.options.other')}</Option>
            </Select>
          </Form.Item>

          <CustomButton
            btnAccept
            className="w-full mt-4"
            title={t('buttons.submit')}
            type="submit"
            onClick={() => form.submit()}
          />
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default UpdateStaffModal;
