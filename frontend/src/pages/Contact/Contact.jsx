import { Input, Button, Form } from "antd";

function ContactForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form Data: ", values);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Contact Us
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          {/* Name Field */}
          <Form.Item
            name="name"
            label={<span className="text-gray-800 font-medium">Name</span>}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Your Name" className="rounded-md" />
          </Form.Item>

          {/* Email Field */}
          <Form.Item
            name="email"
            label={<span className="text-gray-800 font-medium">Email</span>}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="Your Email" className="rounded-md" />
          </Form.Item>

          {/* Message Field */}
          <Form.Item
            name="message"
            label={<span className="text-gray-800 font-medium">Message</span>}
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea
              placeholder="Write your message..."
              rows={4}
              className="rounded-md"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
            >
              Send Message
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ContactForm;
