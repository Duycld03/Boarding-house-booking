import { useState } from 'react';
import { Form, Select, Modal, Input, DatePicker, ConfigProvider } from 'antd';
import { Button as CustomButton } from '@/component';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import classNames from 'classnames';
import Style from './AddAccountModal.module.css';

const cx = classNames.bind(Style);
const { Option } = Select;

const AddStaffModal = ({ onAddData }) => {
  const { t } = useTranslation('staffManagement');
  const { darkMode } = useTheme();

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [form1Data, setForm1Data] = useState({});

  const showModal = () => setIsModalVisible(true);

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
        setForm1Data(values);
        setStep(2);
      })
      .catch(() => {
        toast.error(t('errors.form1'));
      });
  };

  const handleSubmit = () => {
    form2
      .validateFields()
      .then((values2) => {
        const { confirmPassword, ...accountData } = values2;
        const finalValues = {
          ...form1Data,
          ...accountData,
          role: 'staff',
        };
        onAddData(finalValues);
        handleCancel();
      })
      .catch(() => {
        toast.error(t('errors.form2'));
      });
  };

  return (
    <ConfigProvider>
      <CustomButton
        btnAdd
        title={t('buttons.addNew')}
        size="large"
        onClick={showModal}
      />

      <Modal
        title={t('modals.createAccount.title')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        {step === 1 && (
          <Form form={form1} layout="vertical">
            <Form.Item
              label={t('forms.fullname.label')}
              name="fullname"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.fullname.required') },
                {
                  pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                  message: t('forms.fullname.invalidFormat'),
                },
              ]}
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
              <Select placeholder={t('forms.gender.placeholder')}>
                <Option value="male">{t('forms.gender.options.male')}</Option>
                <Option value="female">
                  {t('forms.gender.options.female')}
                </Option>
                <Option value="other">{t('forms.gender.options.other')}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t('forms.phoneNumber.label')}
              name="phoneNumber"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.phoneNumber.required') },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: t('forms.phoneNumber.invalidFormat'),
                },
              ]}
            >
              <Input placeholder={t('forms.phoneNumber.placeholder')} />
            </Form.Item>

            <Form.Item
              label={t('updateAccount.creationDate')}
              name="hireDate"
              style={{ marginBottom: 0 }}
              rules={[
                {
                  required: true,
                  message:
                    t('forms.hireDate.required') ||
                    'Vui lòng chọn ngày tuyển dụng.',
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                className={cx('custom-datepicker')}
                placeholder={t('forms.hireDate.placeholder') || 'Chọn ngày'}
                renderExtraFooter={() => null}
              />
            </Form.Item>

            <div className="mt-4">
              <CustomButton
                title={t('buttons.next')}
                onClick={handleNext}
                btnAccept
                className="w-full"
              />
            </div>
          </Form>
        )}

        {step === 2 && (
          <Form form={form2} layout="vertical">
            <Form.Item
              label={t('forms.username.label')}
              name="username"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.username.required') },
              ]}
            >
              <Input placeholder={t('forms.username.placeholder')} />
            </Form.Item>

            <Form.Item
              label={t('forms.password.label')}
              name="password"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.password.required') },
                { min: 6, message: t('forms.password.minLength') },
              ]}
            >
              <div className="bg-[#111827] border border-gray-600 rounded-md focus-within:border-gray-500">
                <Input.Password
                  placeholder={t('forms.password.placeholder')}
                  bordered={false} // ⛔ tắt mặc định border của AntD
                  className="bg-transparent text-white focus:outline-none focus:ring-0 shadow-none"
                />
              </div>
            </Form.Item>

            <Form.Item
              label={t('forms.confirmPassword.label')}
              name="confirmPassword"
              dependencies={['password']}
              style={{ marginBottom: 0 }}
              rules={[
                {
                  required: true,
                  message: t('forms.confirmPassword.required'),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('forms.confirmPassword.mismatch'))
                    );
                  },
                }),
              ]}
            >
              <div className="bg-[#111827] border border-gray-600 rounded-md focus-within:border-gray-500">
                <Input.Password
                  placeholder={t('forms.confirmPassword.placeholder')}
                  bordered={false} // ⛔ tắt mặc định border của AntD
                  className="bg-transparent text-white focus:outline-none focus:ring-0 shadow-none"
                />
              </div>
            </Form.Item>

            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <CustomButton
                  onClick={() => setStep(1)}
                  btnCancel
                  title={t('buttons.back')}
                  className="w-full"
                />
              </div>
              <div className="w-1/2">
                <CustomButton
                  onClick={handleSubmit}
                  btnAccept
                  title={t('buttons.submit')}
                  className="w-full"
                />
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default AddStaffModal;
