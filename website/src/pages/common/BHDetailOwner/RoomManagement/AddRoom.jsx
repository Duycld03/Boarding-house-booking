import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Upload, Select, Row, Col, Typography } from "antd";
import { Button } from "@/component";
import { PlusOutlined, CameraOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { addRoom, getRoomTypeByBhId } from "@/api/ownerUser/boardingHouseAPI";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const { Text } = Typography;

function AddRoom({ boardingHouseId, refreshRoomData }) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      toast.error(t("roomManagement.addRoom.validation.imageRequired"));
      return;
    }

    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append("roomNumber", values.roomNumber);
    formData.append("boardingHouseId", boardingHouseId);
    formData.append("description", values.description);
    formData.append("roomTypeId", values.roomType);
    formData.append("Room", fileList[0].originFileObj);

    try {
      const res = await addRoom(formData);
      refreshRoomData();
      toast.success(res.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingSubmit(false);
      onCancel();
    }
  };

  const onCancel = () => {
    setVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList.slice(-1));
  };

  const fetchRoomTypes = async () => {
    if (!visible) return;
    try {
      const res = await getRoomTypeByBhId(boardingHouseId);
      setRoomTypes(res.data);
      if (res.data.length == 0) {
        throw new Error("No room type found");
      }
    } catch (error) {
      Modal.confirm({
        title: t("roomManagement.addRoom.noRoomType.title"),
        content: t("roomManagement.addRoom.noRoomType.content"),
        onOk: () => {
          setVisible(false);
        },
        okText: t("common.ok"),
        cancelButtonProps: { style: { display: "none" } },
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [visible]);

  const getImageContainerClasses = () => {
    return darkMode
      ? "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600"
      : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300";
  };

  const getTextColor = () => {
    return darkMode ? "text-gray-200" : "text-gray-800";
  };

  return (
    <div>
      <div className="flex justify-between mb-4 ml-2">
        <Button
          title={t("roomManagement.addRoom.button.addRoom")}
          btnAdd
          size="large"
          onClick={() => setVisible(true)}
        />
      </div>

      <Modal
        confirmLoading={loadingSubmit}
        title={t("roomManagement.addRoom.modal.title")}
        onCancel={onCancel}
        open={visible}
        onOk={form.submit}
        okText={t("roomManagement.addRoom.modal.okText")}
        cancelText={t("roomManagement.common.cancel")}
        destroyOnClose
        width={900}
        className="add-room-modal"
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={24} align="stretch">
            {/* Left side - Room Image */}
            <Col span={10}>
              <Form.Item
                label={
                  <Text strong className={`${getTextColor()}`}>
                    {t("roomManagement.addRoom.form.image.label")}
                  </Text>
                }
                name="image"
                extra={
                  <Text
                    className={`
                      ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("roomManagement.addRoom.form.image.extra")}
                  </Text>
                }
                className="upload-form-item"
              >
                <div
                  className={`${getImageContainerClasses()} rounded-xl h-[380px] flex items-center justify-center relative overflow-hidden border-2 border-dashed transition-all duration-300 hover:border-blue-500`}
                >
                  {fileList.length > 0 ? (
                    <img
                      src={
                        fileList[0].url ||
                        URL.createObjectURL(fileList[0].originFileObj)
                      }
                      alt="Room Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <CameraOutlined
                        className={`text-6xl mb-4 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <Text
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        } font-medium text-center text-lg`}
                      >
                        {t("roomManagement.addRoom.form.image.uploadText")}
                      </Text>
                      <Text
                        className={`${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } text-sm mt-2 text-center`}
                      >
                        {t("roomManagement.addRoom.form.image.uploadHint")}
                      </Text>
                      <Text
                        className={`${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        } text-xs mt-1 text-center`}
                      >
                        {t(
                          "roomManagement.addRoom.form.image.supportedFormats"
                        )}
                      </Text>
                    </div>
                  )}

                  {/* Upload overlay */}
                  <Upload
                    fileList={[]}
                    maxCount={1}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        toast.error(
                          t(
                            "roomManagement.addRoom.validation.invalidImageType"
                          )
                        );
                        return false;
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        toast.error(
                          t("roomManagement.addRoom.validation.imageSizeLimit")
                        );
                        return false;
                      }

                      // Add file to fileList
                      const newFile = {
                        uid: Date.now().toString(),
                        name: file.name,
                        status: "done",
                        originFileObj: file,
                      };
                      setFileList([newFile]);
                      return false; // Prevent auto upload
                    }}
                    showUploadList={false}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                      <div className="bg-white dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <CameraOutlined
                          className={`${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                    </div>
                  </Upload>
                </div>
              </Form.Item>
            </Col>

            {/* Right side - Form fields */}
            <Col span={14}>
              <div className="form-fields-container h-[380px] flex flex-col justify-between">
                {/* Room Type */}
                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.addRoom.form.roomType.label")}
                    </Text>
                  }
                  name="roomType"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.addRoom.form.roomType.required"
                      ),
                    },
                  ]}
                  className="form-field-item"
                >
                  <Select
                    size="large"
                    placeholder={t(
                      "roomManagement.addRoom.form.roomType.placeholder"
                    )}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    className={`rounded-lg h-14 ${
                      darkMode
                        ? "[&_.ant-select-selector]:bg-gray-700 [&_.ant-select-selector]:border-gray-600 [&_.ant-select-selector]:text-gray-200"
                        : ""
                    }`}
                  >
                    {roomTypes.map((roomType) => (
                      <Select.Option key={roomType._id} value={roomType._id}>
                        {roomType.typeName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Room Number */}
                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.addRoom.form.roomNumber.label")}
                    </Text>
                  }
                  name="roomNumber"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.addRoom.form.roomNumber.required"
                      ),
                    },
                  ]}
                  className="form-field-item"
                >
                  <Input
                    size="large"
                    placeholder={t(
                      "roomManagement.addRoom.form.roomNumber.placeholder"
                    )}
                    className={`rounded-lg h-14 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>

                {/* Description */}
                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.addRoom.form.description.label")}
                    </Text>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.addRoom.form.description.required"
                      ),
                    },
                  ]}
                  className="form-field-item flex-1"
                >
                  <Input.TextArea
                    size="large"
                    placeholder={t(
                      "roomManagement.addRoom.form.description.placeholder"
                    )}
                    autoSize={{ minRows: 5, maxRows: 7 }}
                    showCount
                    maxLength={500}
                    className={`rounded-lg ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style jsx>{`
        .add-room-modal .ant-modal-body {
          padding: 24px;
        }

        .add-room-modal .ant-modal-header {
          border-bottom: 1px solid ${darkMode ? "#374151" : "#f0f0f0"};
          background: ${darkMode ? "#1f2937" : "#fff"};
        }

        .add-room-modal .ant-modal-content {
          background: ${darkMode ? "#1f2937" : "#fff"};
        }

        .add-room-modal .ant-modal-footer {
          border-top: 1px solid ${darkMode ? "#374151" : "#f0f0f0"};
          background: ${darkMode ? "#1f2937" : "#fff"};
        }

        /* Upload container styling */
        .upload-form-item {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .upload-form-item .ant-form-item-control {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Form fields container */
        .form-fields-container {
          padding: 4px 0;
        }

        .form-field-item {
          margin-bottom: 16px;
        }

        .form-field-item:last-child {
          margin-bottom: 0;
        }

        .form-field-item.flex-1 {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .form-field-item.flex-1 .ant-form-item-control {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .form-field-item.flex-1 .ant-form-item-control-input {
          flex: 1;
        }

        .form-field-item.flex-1 .ant-input {
          height: 100% !important;
          min-height: 120px;
        }

        /* Dark mode specific styles */
        ${darkMode
          ? `
          .add-room-modal .ant-modal-title {
            color: #f3f4f6;
          }
          
          .add-room-modal .ant-form-item-label > label {
            color: #f3f4f6;
          }
          
          .add-room-modal .ant-form-item-extra {
            color: #9ca3af;
          }
        `
          : ""}

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .add-room-modal {
            width: 95% !important;
            max-width: none !important;
          }

          .form-fields-container {
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AddRoom;
