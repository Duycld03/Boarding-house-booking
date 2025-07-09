import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Select, Upload, Row, Col, Typography } from "antd";
import { Button } from "@/component";
import { useTranslation } from "react-i18next";
import { CameraOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useTheme } from "@/context/ThemeContext"; // Thêm useTheme

const { Text } = Typography;
const { TextArea } = Input;

function EditRoomModal({ room, roomTypes, onClose, onUpdate, visible }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme(); // Thêm useTheme

  // Lưu trữ dữ liệu gốc để khôi phục khi Cancel
  const originalData = useRef(null);

  // Reset form và state khi modal mở/đóng
  useEffect(() => {
    if (visible && room) {
      console.log("Setting up modal for room:", room);

      // Lưu lại dữ liệu gốc
      originalData.current = { ...room };

      // Thiết lập giá trị form
      form.setFieldsValue({
        roomNumber: room.roomNumber,
        description: room.description,
        roomTypeId: room.roomTypeId?._id || room.roomTypeId,
      });

      // Thiết lập hình ảnh
      setupImageDisplay(room.image);
    } else if (!visible) {
      // Reset khi modal đóng
      form.resetFields();
      setPreviewImage(null);
      setImageFile(null);
    }
  }, [room, visible, form]);

  // Thiết lập hiển thị hình ảnh dựa trên loại
  const setupImageDisplay = (image) => {
    if (!image) {
      setPreviewImage(null);
      setImageFile(null);
      return;
    }

    if (typeof image === "string") {
      // URL hình ảnh hiện có
      setPreviewImage(image);
      setImageFile(null);
    } else if (image instanceof File) {
      // File mới tải lên
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImageFile(image);
      };
      reader.readAsDataURL(image);
    } else if (image.preview) {
      // Object với preview (từ ConfigurationStep)
      setPreviewImage(image.preview);
      setImageFile(image.file);
    }
  };

  // Xử lý upload hình ảnh
  const handleImageUpload = (file) => {
    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t("roomManagement.form.imageSizeError") ||
          "Image must be smaller than 5MB"
      );
      return false;
    }

    // Chuyển đổi file sang base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setImageFile(file);
    };

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };

    reader.readAsDataURL(file);
    return false; // Ngăn upload tự động
  };

  // Xử lý xóa hình ảnh
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  // Xử lý gửi form
  const handleSubmit = (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để update
      const updateData = {
        roomNumber: values.roomNumber,
        description: values.description,
        roomTypeId: values.roomTypeId,
      };

      // Thêm hình ảnh nếu có
      if (imageFile) {
        updateData.image = imageFile;
      } else if (previewImage) {
        // Nếu chỉ có URL preview nhưng không có file mới
        updateData.image = room.image; // Giữ nguyên hình ảnh cũ
      } else {
        // Nếu đã xóa hình ảnh
        updateData.image = null;
      }

      onUpdate(
        room.id || room._id,
        updateData,
        { isFinal: true } // Đánh dấu đây là update cuối cùng
      );

      onClose();
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(
        t("roomManagement.editRoom.error") || "Failed to update room"
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy - khôi phục dữ liệu gốc
  const handleCancel = () => {
    if (originalData.current) {
      // Khôi phục lại dữ liệu gốc trên UI
      onUpdate(room.id || room._id, originalData.current, { isRevert: true });
    }
    onClose();
  };

  // Thêm hàm này để lấy CSS class dựa vào darkMode
  const getModalStyle = () => {
    if (darkMode) {
      return {
        content: {
          background: "#1f2937", // bg-gray-800
          borderColor: "#374151", // border-gray-700
        },
        header: {
          background: "#1f2937", // bg-gray-800
          borderBottom: "1px solid #374151", // border-gray-700
          color: "#f3f4f6", // text-gray-100
        },
        body: {
          background: "#1f2937", // bg-gray-800
          color: "#e5e7eb", // text-gray-200
        },
        footer: {
          background: "#1f2937", // bg-gray-800
          borderTop: "1px solid #374151", // border-gray-700
        },
      };
    }
    return {};
  };

  const getInputClasses = () => {
    return darkMode ? "bg-gray-700 border-gray-600 text-white" : "";
  };

  if (!visible || !room) {
    return null;
  }

  return (
    <Modal
      title={t("roomManagement.editRoom.title") || "Edit Room"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={700}
      maskClosable={false}
      styles={getModalStyle()}
      className={darkMode ? "custom-dark-modal" : ""}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          roomNumber: room?.roomNumber || "",
          description: room?.description || "",
          roomTypeId: room?.roomTypeId?._id || room?.roomTypeId || "",
        }}
      >
        {/* Room Information */}
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Text strong className={darkMode ? "text-white" : ""}>
                  {t("roomManagement.table.roomNumber") || "Room Number"}
                </Text>
              }
              name="roomNumber"
              rules={[
                {
                  required: true,
                  message:
                    t("roomManagement.form.roomNumber.required") ||
                    "Please enter room number",
                },
                {
                  pattern: /^[A-Za-z0-9-_]+$/,
                  message:
                    t("roomManagement.form.roomNumber.pattern") ||
                    "Room number can only contain letters, numbers, hyphens, and underscores",
                },
              ]}
            >
              <Input
                placeholder={
                  t("roomManagement.form.roomNumber.placeholder") ||
                  "e.g., A101, B-205"
                }
                size="large"
                className={getInputClasses()}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Text strong className={darkMode ? "text-white" : ""}>
                  {t("roomManagement.table.roomType") || "Room Type"}
                </Text>
              }
              name="roomTypeId"
              rules={[
                {
                  required: true,
                  message:
                    t("roomManagement.form.roomType.required") ||
                    "Please select room type",
                },
              ]}
            >
              <Select
                placeholder={
                  t("roomManagement.form.roomType.placeholder") ||
                  "Select room type"
                }
                size="large"
                className={darkMode ? "ant-select-dark" : ""}
                dropdownClassName={darkMode ? "ant-select-dropdown-dark" : ""}
              >
                {roomTypes && roomTypes.length > 0 ? (
                  roomTypes.map((type) => (
                    <Select.Option key={type._id} value={type._id}>
                      {type.typeName || type.name || "Unnamed Type"}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value="" disabled>
                    {t("roomManagement.form.roomType.noTypes") ||
                      "No room types available"}
                  </Select.Option>
                )}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label={
                <Text strong className={darkMode ? "text-white" : ""}>
                  {t("roomManagement.updateRoom.description") || "Description"}
                </Text>
              }
              name="description"
              rules={[
                {
                  required: true,
                  message:
                    t("roomManagement.form.description.required") ||
                    "Please enter description",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  t("roomManagement.form.description.placeholder") ||
                  "Enter room description..."
                }
                showCount
                maxLength={500}
                size="large"
                className={getInputClasses()}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label={
                <Text strong className={darkMode ? "text-white" : ""}>
                  {t("roomManagement.form.image.label") ||
                    "Room Image (Optional)"}
                </Text>
              }
            >
              <div
                className={`rounded-xl h-[300px] flex items-center justify-center relative overflow-hidden border-2 border-dashed transition-all duration-300 ${
                  previewImage
                    ? darkMode
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-blue-400 bg-blue-50"
                    : darkMode
                    ? "border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-blue-900/20"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {!previewImage ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <CameraOutlined
                      className={`text-5xl mb-4 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <div
                      className={`text-base font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("roomManagement.updateRoom.clickToUploadImage") ||
                        "Click to upload room image"}
                    </div>
                    <div
                      className={`text-xl mt-2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {t("roomManagement.form.image.supportedFormats") ||
                        "JPG, PNG up to 5MB"}
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewImage}
                    alt="Room Preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Upload overlay */}
                <Upload
                  accept="image/*"
                  beforeUpload={handleImageUpload}
                  showUploadList={false}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                    <div
                      className={`${
                        darkMode ? "bg-gray-800" : "bg-white"
                      } rounded-full w-14 h-14 flex items-center justify-center shadow-lg`}
                    >
                      <CameraOutlined
                        className={`text-2xl ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                </Upload>

                {previewImage && (
                  <div className="absolute bottom-2 right-2">
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      type="primary"
                      size="small"
                      onClick={handleRemoveImage}
                    >
                      {t("common.remove") || "Remove"}
                    </Button>
                  </div>
                )}
              </div>

              {imageFile && (
                <div
                  className={`text-xl text-center p-2 rounded mt-2 ${
                    darkMode
                      ? "text-gray-400 bg-gray-800"
                      : "text-gray-500 bg-gray-50"
                  }`}
                >
                  {imageFile.name} • {(imageFile.size / 1024).toFixed(1)} KB
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Form.Item>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              title={t("common.cancel") || "Cancel"}
              onClick={handleCancel}
              btnCancel
              className="h-10"
            />
            <Button
              title={t("common.save") || "Save Changes"}
              htmlType="submit"
              loading={loading}
              btnAdd
              className="h-10"
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditRoomModal;
