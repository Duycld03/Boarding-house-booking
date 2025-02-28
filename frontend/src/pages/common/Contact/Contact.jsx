import { Form, Input, Button } from 'antd';
import {
  TwitterOutlined,
  FacebookOutlined,
  GoogleOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

function Contact() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form submitted:', values);
  };

  return (
    <section className="flex justify-center items-center py-16 bg-white rounded-xl shadow-lg">
      <div className="flex gap-12 w-full max-w-[1100px]">
        {/* Form - 40% width */}
        <div className="w-2/5 bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-[22px] font-semibold mb-5">Get in Touch</h3>
          <Form
            form={form}
            layout="vertical"
            className="space-y-4"
            onFinish={onFinish}
          >
            {/* First Name */}
            <Form.Item
              label="FIRST NAME"
              name="firstName"
              rules={[
                { required: true, message: 'First name is required!' },
                {
                  min: 2,
                  message: 'First name must be at least 2 characters!',
                },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message:
                    'First name cannot contain numbers or special characters!',
                },
              ]}
            >
              <Input
                placeholder="Please enter first name..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="EMAIL"
              name="email"
              rules={[
                { required: true, message: 'Email is required!' },
                { type: 'email', message: 'Please enter a valid email!' },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email format!',
                },
              ]}
            >
              <Input
                placeholder="Please enter email..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              label="PHONE NUMBER"
              name="phone"
              rules={[
                { required: true, message: 'Phone number is required!' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Phone number must be 10 digits!',
                },
              ]}
            >
              <Input
                placeholder="Please enter phone number..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            {/* Message */}
            <Form.Item
              label="WHAT DO YOU HAVE IN MIND ?"
              name="message"
              rules={[{ required: true, message: 'Message cannot be empty!' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Please enter query..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-500 text-white rounded-full h-[45px] text-[16px] hover:bg-blue-700"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Contact Info + Map - 60% width */}
        <div className="w-3/5 flex flex-col items-start">
          <h3 className="text-[20px] font-semibold text-blue-500">
            Reach us at
          </h3>
          <p className="text-gray-700 text-[14px] mt-2">
            Trường Đại học FPT Cần Thơ - nơi đào tạo công nghệ và kỹ năng hàng
            đầu.
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
