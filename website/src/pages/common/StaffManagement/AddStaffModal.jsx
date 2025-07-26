import { useState } from 'react';
import { Form, Select, Modal, Input, DatePicker, ConfigProvider } from 'antd';
import { Button as CustomButton } from '@/component';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import classNames from 'classnames';
import Style from './AddModal.module.css';

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
        className={darkMode ? 'dark-mode-modal' : ''}
      >
        {step === 1 && (
          <Form
            form={form1}
            layout="vertical"
            className={darkMode ? 'dark-mode-form' : ''}
          >
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
              <Input
                placeholder={t('forms.fullname.placeholder')}
                className={darkMode ? 'dark-mode-input' : ''}
              />
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
              <Input
                placeholder={t('forms.email.placeholder')}
                className={darkMode ? 'dark-mode-input' : ''}
              />
            </Form.Item>

            <Form.Item
              label={t('forms.gender.label')}
              name="gender"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: t('forms.gender.required') }]}
            >
              <Select
                className={darkMode ? 'dark-mode-select' : ''}
                placeholder={t('forms.gender.placeholder')}
              >
                <Option value="male">{t('forms.gender.options.male')}</Option>
                <Option value="female">
                  {t('forms.gender.options.female')}
                </Option>
                <Option value="other">{t('forms.gender.options.other')}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t('updateAccount.creationDate')}
              name="hireDate"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.hireDate.required') },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                className={darkMode ? 'dark-mode-datepicker' : ''}
                placeholder={t('forms.hireDate.placeholder') || 'Chọn ngày'}
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
          <Form
            form={form2}
            layout="vertical"
            className={darkMode ? 'dark-mode-form' : ''}
          >
            <Form.Item
              label={t('forms.username.label')}
              name="username"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('forms.username.required') },
              ]}
            >
              <Input
                placeholder={t('forms.username.placeholder')}
                className={darkMode ? 'dark-mode-input' : ''}
              />
            </Form.Item>

            <Form.Item
              label="Nhập mật khẩu"
              name="password"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                className={darkMode ? 'dark-mode-input' : ''}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              style={{ marginBottom: 0 }}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Mật khẩu không khớp!');
                  },
                }),
              ]}
            >
              <Input.Password
                className={darkMode ? 'dark-mode-input' : ''}
                placeholder="Xác nhận mật khẩu"
              />
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
