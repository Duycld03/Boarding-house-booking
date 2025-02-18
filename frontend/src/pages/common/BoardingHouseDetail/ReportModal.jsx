import { Modal, Form, Input, Image, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { toast } from "react-toastify";
import { createReport } from "../../../api/reportManagement";

const reasonOptions = {
  boardingHouse: [
    "Scam on Rent or Deposit",
    "False Advertisement",
    "Violation of Privacy",
    "Unfriendly Landlord",
    "Poor Security",
  ],
  review: [
    "Spam",
    "Misleading information",
    "Privacy violation",
    "Inappropriate content",
  ],
};

const ReportModal = ({
  visible,
  toggleVisible,
  boardingHouseId,
  reviewId,
  setReviewId,
}) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [imageFileList, setImageFileList] = useState([]);

  const onCancel = () => {
    toggleVisible(false);
    form.resetFields();
    setImageFileList([]);
    setReviewId("");
  };

  const handleChangeImage = ({ file, fileList }) => {
    if (fileList.length <= 6) {
      setImageFileList(fileList);
    } else {
      toast.error("You can only upload up to 6 images");
    }
  };

  const handleRemoveOtherImage = (index) => {
    setImageFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("reason", values.reason);
    formData.append("details", values.detail);
    formData.append("boardingHouseId", boardingHouseId);
    if (reviewId) {
      formData.append("reviewId", reviewId);
    }

    imageFileList.forEach((file) => {
      formData.append("report", file.originFileObj);
    });

    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      const res = await createReport(formData);
      toast.success(res.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  return (
    <Modal
      title="Report"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Report"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Reason" name="reason" rules={[{ required: true }]}>
          <Select
            size="large"
            placeholder="Select a reason"
            rules={[{ required: true }]}
          >
            {reasonOptions[reviewId ? "review" : "boardingHouse"].map(
              (option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              )
            )}
          </Select>
        </Form.Item>
        <Form.Item label="Detail" name="detail" rules={[{ required: true }]}>
          <Input.TextArea size="large" placeholder="Enter detail" />
        </Form.Item>
        <Form.Item label="Images" name="images">
          <div className="mt-4 flex flex-wrap gap-4">
            {imageFileList?.map((file, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(file.originFileObj)}
                  alt={`Other ${index + 1}`}
                  className="object-cover border rounded"
                  width={100}
                  height={100}
                  preview={{
                    mask: <span>Preview</span>,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOtherImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                >
                  X
                </button>
              </div>
            ))}

            {/* Upload component */}
            <Upload
              listType="picture-card"
              showUploadList={false}
              className="custom-upload"
              multiple
              accept="image/*"
              onChange={handleChangeImage}
              fileList={imageFileList}
              beforeUpload={() => false}
            >
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                <PlusOutlined className="text-2xl text-gray-400" />
                <p className="text-gray-500 mt-2 text-sm font-medium">
                  Add Images
                </p>
                <p className="text-gray-400 text-xs">
                  Drag-drop or click here to choose a file
                </p>
              </div>
            </Upload>
          </div>
          <style>
            {`
                            .custom-upload .ant-upload
                            {
                            border: none !important;
                            background: none !important;
                            padding: 0 !important;
                            }
                        `}
          </style>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportModal;
