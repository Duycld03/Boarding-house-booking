import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  Row,
  Col,
  InputNumber,
  Card,
  Typography,
  Upload,
  Image,
  Space,
  Divider,
  Alert,
  Button as AntButton,
  Collapse,
  Tag,
} from "antd";
import {
  CameraOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button } from "@/component";
import { useTranslation } from "react-i18next"; // Thêm useTranslation
import { useTheme } from "@/context/ThemeContext"; // Thêm useTheme
import { toast } from "react-toastify"; // Thêm toast
import "./AddRoom.css"; // Import custom styles

const { Title, Text } = Typography;
const { TextArea } = Input;

// Hàm tạo room number theo định dạng
const generateRoomNumber = (floor, roomIndex, format, prefix = "") => {
  const roomNumber = roomIndex + 1;
  // Bỏ dấu gạch ngang "-" khi thêm prefix
  const prefixStr = prefix ? `${prefix}` : "";

  switch (format) {
    case "floor-room":
      return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;

    case "sequential":
      return `${prefixStr}${roomNumber}`;

    case "padded-sequential":
      return `${prefixStr}${roomNumber.toString().padStart(2, "0")}`;

    case "letter":
      const floorLetter = String.fromCharCode(64 + parseInt(floor)); // A=65, B=66, etc.
      return `${prefixStr}${floorLetter}${roomNumber}`;

    case "other":
      if (customFormat) {
        // Xử lý customFormat
        return processCustomFormat(customFormat, {
          floor,
          room: roomNumber,
          prefix: prefix || "",
        });
      }
      return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;

    default:
      return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;
  }
};

// Thêm hàm này nếu bạn vẫn muốn hỗ trợ custom format
const processCustomFormat = (format, data) => {
  let result = format;

  // Xử lý các biến cơ bản
  result = result.replace(/{floor}/g, data.floor);
  result = result.replace(/{room}/g, data.room);
  result = result.replace(/{prefix}/g, data.prefix || "");

  // Xử lý chữ cái dựa trên số tầng
  result = result.replace(
    /{letter}/g,
    String.fromCharCode(64 + parseInt(data.floor))
  );
  result = result.replace(
    /{LETTER}/g,
    String.fromCharCode(64 + parseInt(data.floor)).toUpperCase()
  );

  // Xử lý số phòng với padding zeros
  result = result.replace(/{room:(\d+)d}/g, (match, padding) => {
    return data.room.toString().padStart(parseInt(padding), "0");
  });

  return result;
};

function ConfigurationStep({ form, roomTypes, addMode, setAddMode, onSubmit }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [customNumberingFormat, setCustomNumberingFormat] = useState(false);
  const { t } = useTranslation("bhManagement"); // Thêm useTranslation
  const { darkMode } = useTheme(); // Thêm useTheme

  // Sử dụng Form.useWatch để theo dõi thay đổi của floorConfigs
  const floorConfigs = Form.useWatch("floorConfigs", form) || [];

  // State để lưu trữ tổng số phòng
  const [totalRooms, setTotalRooms] = useState(0);

  // Tính lại tổng số phòng khi floorConfigs thay đổi
  useEffect(() => {
    const total = floorConfigs.reduce(
      (sum, config) => sum + (Number(config?.roomCount) || 0),
      0
    );
    setTotalRooms(total);
  }, [floorConfigs]);

  // Sửa hàm handleImageUpload
  const handleImageUpload = (file) => {
    // Kiểm tra kích thước file (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("roomManagement.validation.imageSizeLimit"));
      return false;
    }

    // Convert file to base64 để tránh lỗi "Not allowed to load local resource"
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setPreviewImage(base64Image);
      setImageFile(file);

      // Lưu cả file và base64 để đảm bảo hiển thị được ở review step
      form.setFieldsValue({
        image: {
          file: file,
          preview: base64Image,
          name: file.name,
          size: file.size,
        },
      });
    };

    reader.onerror = () => {
      toast.error(t("roomManagement.updateRoom.uploadFailed"));
    };

    reader.readAsDataURL(file);
    return false; // Ngăn upload tự động
  };

  const handleRemoveImage = () => {
    if (
      previewImage &&
      typeof previewImage === "string" &&
      previewImage.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setImageFile(null);
    form.setFieldsValue({ image: null });

    toast.info(t("roomManagement.imageRemoved"));
  };

  const handleNumberingFormatChange = (value) => {
    setCustomNumberingFormat(value === "other");
    if (value !== "other") {
      form.setFieldsValue({ customFormat: undefined });
    }
  };

  const handleFinish = (values) => {
    onSubmit(values);
  };

  // Đảm bảo cleanup URLs khi component unmount
  useEffect(() => {
    return () => {
      if (
        previewImage &&
        typeof previewImage === "string" &&
        previewImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, []);

  // Classes cho dark mode
  const getCardClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-700 shadow-md"
      : "bg-white border-gray-200 shadow-sm";
  };

  const getInputBgClasses = () => {
    return darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white";
  };

  const getSecondaryBgClasses = () => {
    return darkMode ? "bg-gray-700" : "bg-gray-50";
  };

  const getTextColorClasses = () => {
    return darkMode ? "text-gray-300" : "text-gray-800";
  };

  const getSecondaryTextColorClasses = () => {
    return darkMode ? "text-gray-400" : "text-gray-500";
  };

  const getBorderClasses = () => {
    return darkMode ? "border-gray-700" : "border-gray-200";
  };

  return (
    <div className={darkMode ? "text-white" : "text-gray-900"}>
      {/* Mode Selection */}
      <Card className={`mb-6 border-0 ${getSecondaryBgClasses()}`}>
        <Title level={5} className={`mb-4 ${getTextColorClasses()}`}>
          {t("roomManagement.addRoom.chooseAddMode")}
        </Title>
        <Radio.Group
          value={addMode}
          onChange={(e) => setAddMode(e.target.value)}
          className="w-full"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Radio.Button
                value="single"
                className={`w-full h-auto p-4 text-center ${
                  darkMode ? "text-white bg-gray-700 hover:bg-gray-600" : ""
                }`}
              >
                <div>
                  <div className="text-2xl font-semibold">
                    {t("roomManagement.addRoom.singleRoom")}
                  </div>
                  <div
                    className={`text-xl mt-1 ${getSecondaryTextColorClasses()}`}
                  >
                    {t("roomManagement.addRoom.addOneRoomAtATime")}
                  </div>
                </div>
              </Radio.Button>
            </Col>
            <Col span={12}>
              <Radio.Button
                value="bulk"
                className={`w-full h-auto p-4 text-center ${
                  darkMode ? "text-white bg-gray-700 hover:bg-gray-600" : ""
                }`}
              >
                <div>
                  <div className="text-2xl font-semibold">
                    {t("roomManagement.addRoom.bulkAdd")}
                  </div>
                  <div
                    className={`text-xl mt-1 ${getSecondaryTextColorClasses()}`}
                  >
                    {t("roomManagement.addRoom.generateMultipleRooms")}
                  </div>
                </div>
              </Radio.Button>
            </Col>
          </Row>
        </Radio.Group>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-6"
        initialValues={{
          floorConfigs: [{ floor: 1, roomCount: 10, roomType: undefined }],
        }}
      >
        {addMode === "single" ? (
          /* Single Room Form */
          <Card className={`border-0 ${getCardClasses()}`}>
            <Title
              level={5}
              className={`mb-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
            >
              {t("roomManagement.addRoom.roomInformation")}
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <Text strong className={darkMode ? "text-white" : ""}>
                      {t("roomManagement.table.roomNumber")}
                    </Text>
                  }
                  name="roomNumber"
                  rules={[
                    {
                      required: true,
                      message: t("roomManagement.form.roomNumber.required"),
                    },
                  ]}
                >
                  <Input
                    placeholder={t(
                      "roomManagement.form.roomNumber.placeholder"
                    )}
                    size="large"
                    className={getInputBgClasses()}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <Text strong className={darkMode ? "text-white" : ""}>
                      {t("roomManagement.table.roomType")}
                    </Text>
                  }
                  name="roomTypeId"
                  rules={[
                    {
                      required: true,
                      message: t("roomManagement.form.roomType.required"),
                    },
                  ]}
                >
                  <Select
                    placeholder={t("roomManagement.form.roomType.placeholder")}
                    size="large"
                    className={darkMode ? "ant-select-dark" : ""}
                  >
                    {roomTypes.map((type) => (
                      <Select.Option key={type._id} value={type._id}>
                        {type.typeName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label={
                    <Text strong className={darkMode ? "text-white" : ""}>
                      {t("roomManagement.updateRoom.description")}
                    </Text>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: t("roomManagement.form.description.required"),
                    },
                  ]}
                >
                  <TextArea
                    placeholder={t(
                      "roomManagement.form.description.placeholder"
                    )}
                    rows={4}
                    size="large"
                    className={getInputBgClasses()}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label={
                    <Text strong className={darkMode ? "text-white" : ""}>
                      {t("roomManagement.form.image.label")}
                    </Text>
                  }
                  name="image"
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
                          {t("roomManagement.updateRoom.clickToUploadImage")}
                        </div>
                        <div
                          className={`text-xl mt-2 ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {t("roomManagement.form.image.supportedFormats")}
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
                          {t("roomManagement.common.remove")}
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
          </Card>
        ) : (
          /* Bulk Room Form */
          <div className="space-y-6">
            <Card className={`border-0 ${getCardClasses()}`}>
              <div className="flex justify-between items-center mb-4">
                <Title
                  level={5}
                  className={`mb-0 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {t("roomManagement.addRoom.floorConfiguration")}
                </Title>
                <div className="flex items-center gap-3">
                  {/* Hiển thị tổng số phòng từ state */}
                  <Tag color="blue">
                    {t("roomManagement.addRoom.total")}: {totalRooms}{" "}
                    {t("roomManagement.addRoom.rooms")}
                  </Tag>
                </div>
              </div>

              <Form.List name="floorConfigs">
                {(fields, { add, remove }) => (
                  <>
                    <div className="space-y-4">
                      {fields.map(({ key, name, ...restField }) => (
                        <Card
                          key={key}
                          size="small"
                          className={`border ${getBorderClasses()}`}
                          title={
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xl font-medium ${
                                  darkMode ? "text-white" : ""
                                }`}
                              >
                                {t("roomManagement.addRoom.floor")}{" "}
                                {form.getFieldValue([
                                  "floorConfigs",
                                  name,
                                  "floor",
                                ]) || name + 1}
                              </span>
                              {fields.length > 1 && (
                                <AntButton
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  size="small"
                                  onClick={() => remove(name)}
                                />
                              )}
                            </div>
                          }
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "floor"]}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "roomManagement.addRoom.floorNumberRequired"
                                    ),
                                  },
                                ]}
                                label={
                                  <Text
                                    strong
                                    className={`text-xl ${
                                      darkMode ? "text-white" : ""
                                    }`}
                                  >
                                    {t("roomManagement.addRoom.floorNumber")}
                                  </Text>
                                }
                              >
                                <InputNumber
                                  min={1}
                                  className={`w-full ${
                                    darkMode ? "ant-input-dark" : ""
                                  }`}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "roomCount"]}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "roomManagement.addRoom.roomCountRequired"
                                    ),
                                  },
                                ]}
                                label={
                                  <Text
                                    strong
                                    className={`text-xl ${
                                      darkMode ? "text-white" : ""
                                    }`}
                                  >
                                    {t("roomManagement.addRoom.roomCount")}
                                  </Text>
                                }
                              >
                                <InputNumber
                                  min={1}
                                  max={100}
                                  className={`w-full ${
                                    darkMode ? "ant-input-dark" : ""
                                  }`}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "roomType"]}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "roomManagement.form.roomType.required"
                                    ),
                                  },
                                ]}
                                label={
                                  <Text
                                    strong
                                    className={`text-xl ${
                                      darkMode ? "text-white" : ""
                                    }`}
                                  >
                                    {t("roomManagement.addRoom.roomType")}
                                  </Text>
                                }
                              >
                                <Select
                                  placeholder={t(
                                    "roomManagement.form.roomType.placeholder"
                                  )}
                                  className="w-full"
                                  size="small"
                                  dropdownClassName={
                                    darkMode ? "ant-select-dropdown-dark" : ""
                                  }
                                >
                                  {roomTypes.map((type) => (
                                    <Select.Option
                                      key={type._id}
                                      value={type._id}
                                    >
                                      {type.typeName}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "namePrefix"]}
                                label={
                                  <Text
                                    strong
                                    className={`text-xl ${
                                      darkMode ? "text-white" : ""
                                    }`}
                                  >
                                    {t("roomManagement.addRoom.prefix")}
                                  </Text>
                                }
                                tooltip={t(
                                  "roomManagement.addRoom.prefixTooltip"
                                )}
                              >
                                <Input
                                  placeholder={t(
                                    "roomManagement.addRoom.prefixPlaceholder"
                                  )}
                                  className={`w-full ${
                                    darkMode ? "ant-input-dark" : ""
                                  }`}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4">
                      <AntButton
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className={
                          darkMode
                            ? "text-gray-300 dark:text-gray-700 border-gray-600 hover:border-blue-400 hover:text-blue-400"
                            : ""
                        }
                      >
                        {t("roomManagement.addRoom.addFloor")}
                      </AntButton>
                    </div>
                  </>
                )}
              </Form.List>

              <Divider className={darkMode ? "border-gray-700" : ""} />

              <Row gutter={[24, 16]}>
                <Col xs={24}>
                  <Form.Item
                    label={
                      <Text strong className={darkMode ? "text-white" : ""}>
                        {t("roomManagement.addRoom.numberingFormat")}
                      </Text>
                    }
                    name="numberingFormat"
                    rules={[
                      {
                        required: true,
                        message: t(
                          "roomManagement.addRoom.selectNumberingFormat"
                        ),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t(
                        "roomManagement.addRoom.selectNumberingFormat"
                      )}
                      size="large"
                      onChange={handleNumberingFormatChange}
                      className={darkMode ? "ant-select-dark" : ""}
                      dropdownClassName={
                        darkMode ? "ant-select-dropdown-dark" : ""
                      }
                    >
                      <Select.Option value="floor-room">
                        {t("roomManagement.addRoom.floorRoomFormat")}
                      </Select.Option>
                      <Select.Option value="sequential">
                        {t("roomManagement.addRoom.sequentialFormat")}
                      </Select.Option>
                      <Select.Option value="padded-sequential">
                        {t("roomManagement.addRoom.paddedSequentialFormat")}
                      </Select.Option>
                      <Select.Option value="letter">
                        {t("roomManagement.addRoom.letterFormat")}
                      </Select.Option>
                      {customNumberingFormat && (
                        <Select.Option value="other">
                          {t("roomManagement.addRoom.otherFormat")}
                        </Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                </Col>

                {customNumberingFormat && (
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Text strong className={darkMode ? "text-white" : ""}>
                          {t("roomManagement.addRoom.customFormat")}
                        </Text>
                      }
                      name="customFormat"
                      rules={[
                        {
                          required: true,
                          message: t(
                            "roomManagement.addRoom.enterCustomFormat"
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          "roomManagement.addRoom.customFormatPlaceholder"
                        )}
                        size="large"
                        className={getInputBgClasses()}
                        suffix={
                          <InfoCircleOutlined
                            className={
                              darkMode
                                ? "text-gray-500 cursor-help"
                                : "text-gray-400 cursor-help"
                            }
                            title={t("roomManagement.addRoom.formatHints")}
                          />
                        }
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Format preview */}
            {form.getFieldValue("numberingFormat") && (
              <div className={`p-3 rounded-lg mt-4 ${getSecondaryBgClasses()}`}>
                <div
                  className={`flex items-center mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <InfoCircleOutlined className="mr-2" />
                  <Text strong className={darkMode ? "text-white" : ""}>
                    {t("roomManagement.addRoom.formatPreview")}
                  </Text>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const format = form.getFieldValue("numberingFormat");
                    const floorConfigs =
                      form.getFieldValue("floorConfigs") || [];
                    const customFormat = form.getFieldValue("customFormat");

                    // Sort floor configs by floor number
                    const sortedFloorConfigs = [...floorConfigs].sort(
                      (a, b) => a.floor - b.floor
                    );

                    // For sequential formats, we need to track the global counter
                    let sequentialCounter = 0;

                    // Generate previews for each floor
                    return sortedFloorConfigs.map((config, i) => {
                      if (!config?.floor || !config?.roomCount) return null;

                      const sampleRoomNumbers = [];

                      // Generate sample room numbers for this floor
                      for (let j = 0; j < Math.min(3, config.roomCount); j++) {
                        try {
                          // Use sequentialCounter for sequential formats
                          const roomIndex =
                            format === "sequential" ||
                            format === "padded-sequential"
                              ? sequentialCounter
                              : j;

                          sampleRoomNumbers.push(
                            generateRoomNumber(
                              config.floor,
                              roomIndex,
                              format,
                              config.namePrefix
                            )
                          );

                          // Increment counter
                          sequentialCounter++;
                        } catch (error) {
                          console.error("Error generating room number:", error);
                        }
                      }

                      // Skip floors with no sample numbers
                      if (sampleRoomNumbers.length === 0) return null;

                      // Show remaining counter number for display purposes
                      if (
                        format === "sequential" ||
                        format === "padded-sequential"
                      ) {
                        sequentialCounter -= Math.min(3, config.roomCount);
                        sequentialCounter += config.roomCount;
                      }

                      return (
                        <div
                          key={i}
                          className="flex flex-row items-center py-1"
                        >
                          <Tag color="blue" className="mr-2">
                            {t("roomManagement.addRoom.floor")} {config.floor}
                          </Tag>
                          <Text
                            className={
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }
                          >
                            {sampleRoomNumbers.join(", ")}
                            {config.roomCount > 3 ? ", ..." : ""}
                          </Text>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Custom Format Instructions */}
            {customNumberingFormat && (
              <Card className={`border-0 ${getCardClasses()}`}>
                <Alert
                  message={t("roomManagement.addRoom.customFormatInstructions")}
                  description={
                    <div className="space-y-2">
                      <div>
                        <strong>
                          {t("roomManagement.addRoom.availableVariables")}
                        </strong>
                      </div>
                      <div className="ml-4 space-y-1">
                        <div>
                          • <code>{`{floor}`}</code> -{" "}
                          {t("roomManagement.addRoom.floorNumber")}
                        </div>
                        <div>
                          • <code>{`{room}`}</code> -{" "}
                          {t("roomManagement.addRoom.roomNumber")}
                        </div>
                        <div>
                          • <code>{`{room:02d}`}</code> -{" "}
                          {t(
                            "roomManagement.addRoom.roomNumberWithLeadingZeros"
                          )}
                        </div>
                        <div>
                          • <code>{`{letter}`}</code> -{" "}
                          {t("roomManagement.addRoom.letterBasedOnFloor")}
                        </div>
                      </div>
                      <div className="mt-3">
                        <strong>{t("roomManagement.addRoom.examples")}</strong>
                      </div>
                      <div className="ml-4 space-y-1">
                        <div>
                          •
                          <code>
                            FL{`{floor}`}-R{`{room:02d}`}
                          </code>
                          → FL1-R01, FL1-R02
                        </div>
                        <div>
                          •
                          <code>
                            {`{letter}`}
                            {`{room}`}
                          </code>
                          → A1, A2, B1, B2
                        </div>
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                  className={darkMode ? "bg-blue-900/30 border-blue-700" : ""}
                />
              </Card>
            )}
          </div>
        )}
      </Form>
    </div>
  );
}

export default ConfigurationStep;
