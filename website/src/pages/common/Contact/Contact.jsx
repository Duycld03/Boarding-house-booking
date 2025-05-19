import { Form, Input, Button, ConfigProvider } from 'antd';
import {
  TwitterOutlined,
  FacebookOutlined,
  GoogleOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import 'react-toastify/dist/ReactToastify.css';

function Contact() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('contact');
  const { darkMode } = useTheme();

  const onFinish = (values) => {
    setLoading(true);
    const templateParams = {
      to_name: 'HY',
      from_name: values.firstName,
      reply_to: values.email,
      phone: values.phone,
      message: values.message,
    };

    emailjs
      .send(
        'service_wsy2unr',
        'template_231iuyj',
        templateParams,
        'qav99nr6ty0xpDGwv'
      )
      .then(() => {
        toast.success(t('success'));
        form.resetFields();
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        toast.error(t('error'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const themeConfig = {
    algorithm: darkMode
      ? ConfigProvider.darkAlgorithm
      : ConfigProvider.defaultAlgorithm,
    token: darkMode
      ? {
          colorText: '#ffffff',
          colorBgContainer: '#1f2937',
          colorBorder: '#4B5563',
          colorTextPlaceholder: '#9CA3AF',
        }
      : {},
    components: {
      Input: darkMode
        ? {
            colorBgContainer: '#374151',
            colorText: '#F9FAFB',
            colorTextPlaceholder: '#9CA3AF',
            colorBorder: '#4B5563',
          }
        : {},
      Form: darkMode
        ? {
            labelColor: '#F9FAFB',
            colorText: '#F9FAFB',
          }
        : {},
    },
  };

  const commonStyle = darkMode
    ? { backgroundColor: '#374151', color: '#ffffff' }
    : {};

  const inputClass = `rounded-md p-2 border outline-none shadow-none transition-colors duration-200 ${
    darkMode
      ? 'bg-gray-700 text-white border-gray-500 placeholder-gray-400 focus:border-blue-400 focus:bg-gray-700'
      : 'border-gray-300'
  }`;

  const buttonClass = `w-full bg-blue-500 text-white rounded-full h-[45px] text-[16px] hover:bg-blue-700 focus:outline-none shadow-none`;

  return (
    <ConfigProvider theme={themeConfig}>
      <section
        className={`flex justify-center items-center py-12 sm:py-16 md:py-20 rounded-xl shadow-lg px-4 sm:px-6 md:px-12 lg:px-16 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Google Map (Mobile & Tablet) */}
          <div className="w-full lg:hidden">
            <iframe
              className="w-full h-[250px] sm:h-[300px] rounded-lg shadow-md"
              src="https://maps.google.com/maps?q=FPT%20University%20Can%20Tho&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          {/* Form */}
          <div
            className={`${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white'
            } p-6 sm:p-8 rounded-xl shadow-lg sm:w-[90%] lg:w-[400px] xl:w-[500px] mx-auto mt-[-50px] lg:mt-0`}
          >
            <h3 className="text-[22px] font-semibold text-center">
              {t('title')}
            </h3>
            <p className="text-center text-[14px] mb-4">{t('description')}</p>

            <Form
              form={form}
              layout="vertical"
              className="space-y-4 mt-4"
              onFinish={onFinish}
            >
              <Form.Item
                label={t('firstName.label')}
                name="firstName"
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: t('firstName.required') },
                  { min: 2, message: t('firstName.minLength') },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: t('firstName.invalidFormat'),
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  placeholder={t('firstName.placeholder')}
                  className={inputClass}
                  style={commonStyle}
                />
              </Form.Item>

              <Form.Item
                label={t('email.label')}
                name="email"
                rules={[
                  {
                    required: true,
                    type: 'email',
                    message: t('email.required'),
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  placeholder={t('email.placeholder')}
                  className={inputClass}
                  style={commonStyle}
                />
              </Form.Item>

              <Form.Item
                label={t('phone.label')}
                name="phone"
                rules={[
                  { required: true, message: t('phone.required') },
                  { pattern: /^[0-9]{10}$/, message: t('phone.invalidFormat') },
                ]}
              >
                <Input
                  autoComplete="off"
                  placeholder={t('phone.placeholder')}
                  className={inputClass}
                  style={commonStyle}
                />
              </Form.Item>

              <Form.Item
                label={t('message.label')}
                name="message"
                rules={[{ required: true, message: t('message.required') }]}
              >
                <Input.TextArea
                  autoComplete="off"
                  rows={4}
                  placeholder={t('message.placeholder')}
                  className={inputClass}
                  style={commonStyle}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={buttonClass}
                >
                  {loading ? t('sending') : t('submit')}
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Contact Info + Map (Laptop) */}
          <div className="hidden lg:flex flex-col items-start">
            <h3 className="text-[20px] font-semibold text-blue-500">
              {t('title')}
            </h3>
            <p
              className={`text-[14px] mt-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {t('description')}
            </p>
            <div className="flex gap-4 text-[20px] text-blue-500 mt-4">
              <TwitterOutlined className="cursor-pointer hover:text-blue-700" />
              <FacebookOutlined className="cursor-pointer hover:text-blue-700" />
              <GoogleOutlined className="cursor-pointer hover:text-blue-700" />
              <InstagramOutlined className="cursor-pointer hover:text-blue-700" />
            </div>
            <iframe
              className="w-full h-[300px] md:h-[350px] lg:h-[400px] rounded-lg shadow-md border-none mt-4"
              src="https://maps.google.com/maps?q=FPT%20University%20Can%20Tho&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </ConfigProvider>
  );
}

export default Contact;
