import { Form, Input, Button } from 'antd';
import {
  TwitterOutlined,
  FacebookOutlined,
  GoogleOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

function Contact() {
  const [form] = Form.useForm();

  return (
    <section className="flex justify-center items-center py-16 bg-white rounded-xl shadow-lg">
      <div className="flex gap-12 w-full max-w-[1100px]">
        {/* Form - 40% width */}
        <div className="w-2/5 bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-[22px] font-semibold mb-5">Get in Touch</h3>
          <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item label="FIRST NAME" name="firstName">
              <Input
                placeholder="Please enter first name..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            <Form.Item
              label="EMAIL"
              name="email"
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: 'Please enter a valid email!',
                },
              ]}
            >
              <Input
                placeholder="Please enter email..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            <Form.Item label="PHONE NUMBER" name="phone">
              <Input
                placeholder="Please enter phone number..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

            <Form.Item label="WHAT DO YOU HAVE IN MIND ?" name="message">
              <Input.TextArea
                rows={4}
                placeholder="Please enter query..."
                className="rounded-md p-2 border border-gray-300"
              />
            </Form.Item>

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
