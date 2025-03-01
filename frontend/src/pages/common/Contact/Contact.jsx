import { Form, Input, Button } from 'antd';
import {
  TwitterOutlined,
  FacebookOutlined,
  GoogleOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Contact() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
      .then(
        () => {
          toast.success('Email sent successfully!');
          form.resetFields();
        },
        (error) => {
          console.error('Failed to send email:', error);
          toast.error('Failed to send email, please try again.');
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section className="flex justify-center items-center py-16 bg-white rounded-xl shadow-lg px-6 md:px-12">
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Google Map (Chỉ full width trên tablet & mobile) */}
        <div className="w-full md:hidden">
          <iframe
            className="w-full h-[250px] rounded-lg shadow-md"
            src="https://maps.google.com/maps?q=FPT%20University%20Can%20Tho&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-auto mx-auto">
          <h3 className="text-[22px] font-semibold text-center">
            Get in Touch
          </h3>
          <p className="text-gray-600 text-center mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis diam
            lectus sapien.
          </p>
          <Form
            form={form}
            layout="vertical"
            className="space-y-4 mt-4"
            onFinish={onFinish}
          >
            <Form.Item
              label="FIRST NAME"
              name="firstName"
              rules={[
                { required: true, message: 'First name is required!' },
                { min: 2, message: 'Must be at least 2 characters!' },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message: 'No numbers or special characters!',
                },
              ]}
            >
              <Input
                placeholder="Enter first name..."
                className="rounded-md p-2 border border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              label="EMAIL"
              name="email"
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: 'Enter a valid email!',
                },
              ]}
            >
              <Input
                placeholder="Enter email..."
                className="rounded-md p-2 border border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              label="PHONE NUMBER"
              name="phone"
              rules={[
                { required: true, message: 'Phone number is required!' },
                { pattern: /^[0-9]{10}$/, message: 'Must be 10 digits!' },
              ]}
            >
              <Input
                placeholder="Enter phone number..."
                className="rounded-md p-2 border border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              label="MESSAGE"
              name="message"
              rules={[{ required: true, message: 'Message cannot be empty!' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter your query..."
                className="rounded-md p-2 border border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-500 text-white rounded-full h-[45px] text-[16px] hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Submit'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Contact Info + Map (PC) */}
        <div className="hidden md:flex flex-col items-start">
          <h3 className="text-[20px] font-semibold text-blue-500">
            Reach us at
          </h3>
          <p className="text-gray-700 text-[14px] mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis diam
            lectus sapien.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 text-[20px] text-blue-500 mt-4">
            <TwitterOutlined className="cursor-pointer hover:text-blue-700" />
            <FacebookOutlined className="cursor-pointer hover:text-blue-700" />
            <GoogleOutlined className="cursor-pointer hover:text-blue-700" />
            <InstagramOutlined className="cursor-pointer hover:text-blue-700" />
          </div>

          {/* Google Maps */}
          <iframe
            className="w-full h-[350px] rounded-lg shadow-md border-none mt-4"
            src="https://maps.google.com/maps?q=FPT%20University%20Can%20Tho&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export default Contact;
