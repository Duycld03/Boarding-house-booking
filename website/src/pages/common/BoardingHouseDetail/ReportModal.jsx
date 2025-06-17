import { Modal, Form, Input, Image, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { toast } from "react-toastify";
import { createReport } from "../../../api/reportAPI";
import { useTheme } from "@/context/ThemeContext";
import styles from "./ReportModal.module.css";
import classNames from "classnames";

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
  handleReportStatus,
}) => {
  const [form] = Form.useForm();
  const { darkMode } = useTheme();
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

    try {
      const res = await createReport(formData);
      toast.success(res.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
      handleReportStatus();
      onCancel();
    }
  };

  return (
    <Modal
      title={
        <span className={darkMode ? styles.darkModalTitle : styles.modalTitle}>
          Report
        </span>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Report"
      confirmLoading={loading}
      destroyOnClose
      bodyStyle={darkMode ? { background: "#111827" } : {}}
      className={darkMode ? "dark" : ""}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label={
            <span
              className={darkMode ? styles.darkTextColor : styles.textColor}
            >
              Reason
            </span>
          }
          name="reason"
          rules={[{ required: true }]}
        >
          <Select
            size="large"
            placeholder="Select a reason"
            rules={[{ required: true }]}
            className={darkMode ? styles.darkInputStyle : styles.inputStyle}
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
        <Form.Item
          label={
            <span
              className={darkMode ? styles.darkTextColor : styles.textColor}
            >
              Detail
            </span>
          }
          name="detail"
          rules={[{ required: true }]}
        >
          <Input.TextArea
            size="large"
            placeholder="Enter detail"
            className={darkMode ? styles.darkInputStyle : styles.inputStyle}
          />
        </Form.Item>
        <Form.Item
          label={
            <span
              className={darkMode ? styles.darkTextColor : styles.textColor}
            >
              Images
            </span>
          }
          name="images"
        >
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
              className={styles.customUpload}
              multiple
              accept="image/*"
              onChange={handleChangeImage}
              fileList={imageFileList}
              beforeUpload={() => false}
            >
              <div
                className={classNames(
                  "flex flex-col items-center justify-center border border-dashed rounded-lg p-6 hover:border-primary transition",
                  darkMode ? styles.darkUploadBox : styles.uploadBox
                )}
              >
                <PlusOutlined
                  className={classNames(
                    "text-2xl",
                    darkMode
                      ? styles.darkUploadIconColor
                      : styles.uploadIconColor
                  )}
                />
                <p
                  className={classNames(
                    "mt-2 text-sm font-medium font-body",
                    darkMode ? styles.darkTextColor : styles.textColor
                  )}
                >
                  Add Images
                </p>
                <p
                  className={classNames(
                    "text-xs font-body",
                    darkMode
                      ? styles.darkUploadTextColor
                      : styles.uploadTextColor
                  )}
                >
                  Drag-drop or click here to choose a file
                </p>
              </div>
            </Upload>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportModal;
