import { useEffect } from 'react';
import { Modal, Form, Input, Select, ConfigProvider } from 'antd';
import { Button as CustomButton } from '@/component';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/themeContext';

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

  const selectStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#fff',
    color: darkMode ? '#fff' : '#000',
    borderColor: darkMode ? '#4b5563' : '#d9d9d9',
  };

  return (
    <ConfigProvider>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        destroyOnClose
        title={t('updateAccount.title')}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onFinishFailed={handleError}
        >
          <Form.Item
            label={t('forms.fullname.label')}
            name="fullname"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: t('forms.fullname.required') }]}
          >
            <Input placeholder={t('forms.fullname.placeholder')} />
          </Form.Item>

          <Form.Item
            label={t('forms.email.label')}
            name="email"
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: t('forms.email.required') },
              { type: 'email', message: t('forms.email.invalidFormat') },
            ]}
          >
            <Input placeholder={t('forms.email.placeholder')} />
          </Form.Item>

          <Form.Item
            label={t('forms.gender.label')}
            name="gender"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: t('forms.gender.required') }]}
          >
            <Select
              placeholder={t('forms.gender.placeholder')}
              style={selectStyle}
              dropdownStyle={selectStyle}
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
