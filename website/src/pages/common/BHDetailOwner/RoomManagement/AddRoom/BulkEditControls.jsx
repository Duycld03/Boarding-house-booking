import React, { useState, useCallback } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Select,
  Input,
  Upload,
  Image,
  Space,
  Divider,
  Alert,
} from "antd";
import { Button } from "@/component";
import "./AddRoom.css"; // Import custom styles
import {
  CameraOutlined,
  DeleteOutlined,
  EyeOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const { Title, Text } = Typography;

function BulkEditControls({
  selectedRooms,
  roomTypes,
  onBulkUpdate,
  onBulkDelete,
  cardClasses,
  isSubmitting = false,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [bulkData, setBulkData] = useState({
    roomTypeId: null,
    description: null,
    image: null,
  });
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();

  // Kiểm tra xem có phòng nào được chọn không
  const noRoomsSelected = selectedRooms.length === 0;

  // Debounced update function để tránh gọi quá nhiều lần
  const debouncedUpdate = useCallback(
    debounce((data) => {
      if (onBulkUpdate && selectedRooms.length > 0) {
        onBulkUpdate(data);
      }
    }, 300),
    [onBulkUpdate, selectedRooms]
  );

  const handleImageUpload = (file) => {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("roomManagement.validation.invalidImageType"));
        return false;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("roomManagement.validation.imageSizeLimit"));
        return false;
      }

      // Clean up previous preview URL
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      // Đọc file thành base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;

        // Lưu trữ dữ liệu hình ảnh
        setPreviewImage(base64Image);
        setImageFile(file);

        const imageData = {
          file: file,
          previewUrl: base64Image,
          name: file.name,
          size: file.size,
        };

        // Update local state
        setBulkData({ ...bulkData, image: imageData });

        // Chỉ gửi data về ảnh, không ghi đè toàn bộ
        debouncedUpdate({ image: imageData });
      };

      reader.readAsDataURL(file);

      toast.success(
        t(
          "roomManagement.messages.imageUploadSuccess",
          "Image uploaded successfully"
        )
      );

      return false; // Prevent default upload
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        t("roomManagement.updateRoom.uploadFailed", "Failed to upload image")
      );

      return false;
    }
  };

  const handleRemoveImage = () => {
    try {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeUtil(previewImage);
      }
      setPreviewImage(null);
      setImageFile(null);

      // Update bulk data
      const newData = { ...bulkData, image: null };
      setBulkData(newData);

      // Call parent update function
      debouncedUpdate(newData);

      toast.success(
        t("roomManagement.messages.imageRemoved", "Image removed successfully")
      );
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(
        t("roomManagement.messages.imageRemoveFailed", "Failed to remove image")
      );
    }
  };

  const handleRoomTypeChange = (value) => {
    try {
      const newData = { ...bulkData, roomTypeId: value };
      setBulkData(newData);

      // Chỉ truyền trường đã thay đổi, không ghi đè toàn bộ
      debouncedUpdate({ roomTypeId: value });

      if (value) {
        const roomType = roomTypes.find((type) => type._id === value);
        toast.success(
          t(
            "roomManagement.messages.roomTypeChanged",
            {
              type:
                roomType?.typeName ||
                t("roomManagement.common.selected", "Selected"),
            },
            "Room type changed to: {type}"
          )
        );
      }
    } catch (error) {
      console.error("Error changing room type:", error);
      toast.error(
        t(
          "roomManagement.messages.roomTypeChangeFailed",
          "Failed to change room type"
        )
      );
    }
  };

  const handleDescriptionChange = (e) => {
    try {
      const value = e.target.value;
      const newData = { ...bulkData, description: value };
      setBulkData(newData);

      // Chỉ truyền trường đã thay đổi
      debouncedUpdate({ description: value });
    } catch (error) {
      console.error("Error changing description:", error);
      toast.error(
        t(
          "roomManagement.messages.descriptionChangeFailed",
          "Failed to change description"
        )
      );
    }
  };

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  return (
    <Card className={`${cardClasses} mb-4 shadow-sm border-0`}>
      <div className="mb-5 flex justify-between items-center">
        <div>
          <Title
            level={4}
            className={`mb-2 ${
              darkMode ? "text-blue-400" : "text-blue-600"
            } font-semibold`}
          >
            {t(
              "roomManagement.reviewStep.bulkEditControls",
              "Bulk Edit Controls"
            )}
          </Title>
          <Text type="secondary" className="text-lg">
            {selectedRooms.length}{" "}
            {t("roomManagement.reviewStep.roomsSelected", "rooms selected")}
          </Text>
        </div>

        {/* Thêm nút Delete Selected */}
        {selectedRooms.length > 0 && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onBulkDelete}
            disabled={isSubmitting}
          >
            {t("roomManagement.reviewStep.deleteSelected", "Delete Selected")} (
            {selectedRooms.length})
          </Button>
        )}
      </div>

      {noRoomsSelected && (
        <Alert
          message={t(
            "roomManagement.reviewStep.noRoomsSelected",
            "No rooms selected"
          )}
          description={t(
            "roomManagement.reviewStep.selectRoomsToEnable",
            "Please select at least one room to enable bulk edit options."
          )}
          type="warning"
          showIcon
          className="mb-5"
        />
      )}

      <Row gutter={[24, 24]} className="mt-2">
        {/* Left Column - Room Type and Description */}
        <Col xs={24} md={12}>
          <div className="flex flex-col h-full space-y-5">
            {/* Room Type */}
            <div className="space-y-2">
              <Text
                strong
                className={darkMode ? "text-white" : "text-gray-700"}
              >
                {t("roomManagement.reviewStep.roomType", "Room Type")}
              </Text>
              <Select
                placeholder={t(
                  "roomManagement.form.roomType.placeholder",
                  "Select room type"
                )}
                className="w-full"
                size="large"
                value={bulkData.roomTypeId}
                onChange={handleRoomTypeChange}
                allowClear
                disabled={noRoomsSelected || isSubmitting}
              >
                {roomTypes.map((type) => (
                  <Select.Option key={type._id} value={type._id}>
                    {type.typeName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Description */}
            <div className="flex-1 flex flex-col space-y-2">
              <Text
                strong
                className={darkMode ? "text-white" : "text-gray-700"}
              >
                {t("roomManagement.reviewStep.description", "Description")}
              </Text>
              <Input.TextArea
                placeholder={t(
                  "roomManagement.form.description.placeholder",
                  "Enter room description..."
                )}
                rows={9}
                value={bulkData.description || ""}
                onChange={handleDescriptionChange}
                className="resize-none flex-1"
                disabled={noRoomsSelected || isSubmitting}
                style={{ minHeight: "240px" }}
              />
            </div>
          </div>
        </Col>

        {/* Right Column - Image Upload */}
        <Col xs={24} md={12}>
          <div className="flex flex-col h-full space-y-2">
            <Text strong className={darkMode ? "text-white" : "text-gray-500"}>
              {t("roomManagement.form.image.label", "Room Image")}
            </Text>

            <div className="flex-1 flex flex-col min-h-0">
              {!previewImage ? (
                <div className="flex-1 flex flex-col">
                  <Upload
                    accept="image/*"
                    beforeUpload={handleImageUpload}
                    showUploadList={false}
                    className="w-full h-full flex items-center justify-center"
                    disabled={noRoomsSelected || isSubmitting}
                  >
                    <div
                      className={`border-2 min-w-[240px] border-dashed rounded-lg transition-all duration-200 w-full flex-1 flex items-center justify-center 
                      ${
                        noRoomsSelected || isSubmitting
                          ? darkMode
                            ? "border-gray-700 bg-gray-800 cursor-not-allowed"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : darkMode
                          ? "border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                      }`}
                    >
                      <div className="text-center px-4 py-8">
                        <div
                          className={`mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full 
                          ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                        >
                          <PictureOutlined
                            className={`text-3xl ${
                              darkMode ? "text-gray-400" : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div
                          className={`${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          } font-medium mb-1`}
                        >
                          {noRoomsSelected
                            ? t(
                                "roomManagement.reviewStep.selectRoomsToUpload",
                                "Please select rooms to upload images"
                              )
                            : t(
                                "roomManagement.reviewStep.clickToUploadImage",
                                "Click to upload image"
                              )}
                        </div>
                        <div
                          className={`text-lg ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {t(
                            "roomManagement.form.image.supportedFormats",
                            "Support: JPG, PNG up to 10MB"
                          )}
                        </div>
                      </div>
                    </div>
                  </Upload>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-3">
                  <div
                    className={`flex-1 relative border-2 rounded-lg overflow-hidden min-h-[290px] flex items-center justify-center 
                      ${
                        darkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-50"
                      }`}
                  >
                    <Image
                      src={previewImage}
                      alt="Room Preview"
                      width="100%"
                      height="100%"
                      className="object-cover"
                      style={{ maxHeight: "290px" }}
                      preview={{
                        mask: (
                          <div className="flex items-center justify-center text-white bg-black bg-opacity-50">
                            <EyeOutlined className="text-lg mr-2" />
                            <span className="text-lg">
                              {t("common.preview", "Preview")}
                            </span>
                          </div>
                        ),
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Upload
                      accept="image/*"
                      beforeUpload={handleImageUpload}
                      showUploadList={false}
                      disabled={isSubmitting}
                    >
                      <Button
                        icon={<CameraOutlined />}
                        size="small"
                        type="primary"
                        ghost
                        disabled={isSubmitting}
                      >
                        {t("roomManagement.reviewStep.change", "Change")}
                      </Button>
                    </Upload>

                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                    >
                      {t("roomManagement.reviewStep.remove", "Remove")}
                    </Button>
                  </div>

                  {imageFile && (
                    <div
                      className={`text-lg text-center p-2 rounded
                      ${
                        darkMode
                          ? "text-gray-400 bg-gray-800"
                          : "text-gray-500 bg-gray-50"
                      }`}
                    >
                      {imageFile.name} • {(imageFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cập nhật propTypes
BulkEditControls.propTypes = {
  selectedRooms: PropTypes.array.isRequired,
  roomTypes: PropTypes.array.isRequired,
  onBulkUpdate: PropTypes.func.isRequired,
  onBulkDelete: PropTypes.func,
  cardClasses: PropTypes.string,
  isSubmitting: PropTypes.bool,
};

export default BulkEditControls;
