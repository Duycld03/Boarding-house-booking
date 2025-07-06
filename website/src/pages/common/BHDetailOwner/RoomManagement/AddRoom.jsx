import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Modal,
  Upload,
  Select,
  Row,
  Col,
  Typography,
  InputNumber,
  Divider,
  Card,
  Checkbox,
  Space,
  Collapse,
  Alert,
  Tag,
} from "antd";
import { Button } from "@/component";
import {
  PlusOutlined,
  CameraOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { addRoom, getRoomTypeByBhId } from "@/api/ownerUser/boardingHouseAPI";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const { Text, Title } = Typography;
const { Panel } = Collapse;

function BulkAddRoom({ boardingHouseId, refreshRoomData }) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [step, setStep] = useState(1); // 1: Configuration, 2: Review
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [duplicateRooms, setDuplicateRooms] = useState(new Set());
  const [existingRoomNumbers, setExistingRoomNumbers] = useState(new Set());

  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();

  // Room numbering format options
  const numberingFormats = [
    {
      value: "floor_room",
      label: "101, 102, 103...",
      pattern: (floor, room) => `${floor}${room.toString().padStart(2, "0")}`,
    },
    {
      value: "floor_dash_room",
      label: "1-1, 1-2, 1-3...",
      pattern: (floor, room) => `${floor}-${room}`,
    },
    {
      value: "prefix_sequential",
      label: "A1, A2, A3...",
      pattern: (floor, room) => `${String.fromCharCode(64 + floor)}${room}`,
    },
    {
      value: "prefix_floor_room",
      label: "R101, R102, R103...",
      pattern: (floor, room) => `R${floor}${room.toString().padStart(2, "0")}`,
    },
  ];

  const generateRooms = (values) => {
    const {
      floors,
      roomsPerFloor,
      roomTypes: floorRoomTypes,
      numberingFormat,
    } = values;
    const selectedFormat = numberingFormats.find(
      (f) => f.value === numberingFormat
    );
    const generatedRooms = [];

    for (let floor = 1; floor <= floors; floor++) {
      const roomsCount = roomsPerFloor[floor - 1] || 0;
      const roomTypeId = floorRoomTypes[floor - 1];

      for (let room = 1; room <= roomsCount; room++) {
        const roomNumber = selectedFormat.pattern(floor, room);
        generatedRooms.push({
          id: `${floor}-${room}`,
          floor: floor,
          roomNumber: roomNumber,
          roomTypeId: roomTypeId,
          description: "",
          image: null,
          hasError: false,
          errorMessage: "",
        });
      }
    }

    return generatedRooms;
  };

  const checkDuplicates = (roomsToCheck) => {
    const roomNumbers = roomsToCheck.map((room) => room.roomNumber);
    const duplicates = new Set();
    const seen = new Set(existingRoomNumbers);

    roomNumbers.forEach((roomNumber) => {
      if (seen.has(roomNumber)) {
        duplicates.add(roomNumber);
      } else {
        seen.add(roomNumber);
      }
    });

    // Check for duplicates within the current batch
    const currentBatch = new Set();
    roomNumbers.forEach((roomNumber) => {
      if (currentBatch.has(roomNumber)) {
        duplicates.add(roomNumber);
      } else {
        currentBatch.add(roomNumber);
      }
    });

    setDuplicateRooms(duplicates);
    return duplicates;
  };

  const onConfigurationSubmit = (values) => {
    const generatedRooms = generateRooms(values);
    const duplicates = checkDuplicates(generatedRooms);

    // Mark rooms with errors
    const roomsWithErrors = generatedRooms.map((room) => ({
      ...room,
      hasError: duplicates.has(room.roomNumber),
      errorMessage: duplicates.has(room.roomNumber)
        ? "Room number already exists"
        : "",
    }));

    setRooms(roomsWithErrors);
    setStep(2);
  };

  const onBulkSubmit = async () => {
    // Check if there are any errors
    const hasErrors = rooms.some((room) => room.hasError);
    if (hasErrors) {
      toast.error(t("roomManagement.bulkAddRoom.validation.fixErrorsFirst"));
      return;
    }

    // Check if all rooms have required fields
    const missingFields = rooms.filter(
      (room) => !room.roomTypeId || !room.description || !room.image
    );

    if (missingFields.length > 0) {
      toast.error(
        t("roomManagement.bulkAddRoom.validation.missingRequiredFields")
      );
      return;
    }

    setLoadingSubmit(true);

    try {
      // Submit all rooms
      const promises = rooms.map((room) => {
        const formData = new FormData();
        formData.append("roomNumber", room.roomNumber);
        formData.append("boardingHouseId", boardingHouseId);
        formData.append("description", room.description);
        formData.append("roomTypeId", room.roomTypeId);
        formData.append("Room", room.image);
        return addRoom(formData);
      });

      await Promise.all(promises);

      refreshRoomData();
      toast.success(
        t("roomManagement.bulkAddRoom.success", { count: rooms.length })
      );
      onCancel();
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("roomManagement.bulkAddRoom.error")
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const onCancel = () => {
    setVisible(false);
    setStep(1);
    form.resetFields();
    setRooms([]);
    setSelectedRooms([]);
    setEditingRoom(null);
    setDuplicateRooms(new Set());
  };

  const handleRoomUpdate = (roomId, field, value) => {
    setRooms((prevRooms) => {
      const newRooms = prevRooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = { ...room, [field]: value };

          // Re-check duplicates for room number changes
          if (field === "roomNumber") {
            const otherRooms = prevRooms.filter((r) => r.id !== roomId);
            const allRoomNumbers = [
              ...otherRooms.map((r) => r.roomNumber),
              value,
            ];
            const duplicates = checkDuplicates(allRoomNumbers);

            updatedRoom.hasError = duplicates.has(value);
            updatedRoom.errorMessage = duplicates.has(value)
              ? "Room number already exists"
              : "";
          }

          return updatedRoom;
        }
        return room;
      });

      return newRooms;
    });
  };

  const handleBulkUpdate = (field, value) => {
    if (selectedRooms.length === 0) {
      toast.warning(
        t("roomManagement.bulkAddRoom.validation.selectRoomsFirst")
      );
      return;
    }

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        selectedRooms.includes(room.id) ? { ...room, [field]: value } : room
      )
    );

    toast.success(
      t("roomManagement.bulkAddRoom.success.bulkUpdate", {
        count: selectedRooms.length,
      })
    );
  };

  const handleRoomSelection = (roomId, checked) => {
    setSelectedRooms((prev) =>
      checked ? [...prev, roomId] : prev.filter((id) => id !== roomId)
    );
  };

  const handleFloorSelection = (floor, checked) => {
    const floorRooms = rooms
      .filter((room) => room.floor === floor)
      .map((room) => room.id);
    setSelectedRooms((prev) =>
      checked
        ? [...prev, ...floorRooms.filter((id) => !prev.includes(id))]
        : prev.filter((id) => !floorRooms.includes(id))
    );
  };

  const fetchRoomTypes = async () => {
    if (!visible) return;
    try {
      const res = await getRoomTypeByBhId(boardingHouseId);
      setRoomTypes(res.data);
      if (res.data.length === 0) {
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
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [visible]);

  const getCardClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-600"
      : "bg-white border-gray-200";
  };

  const getTextColor = () => {
    return darkMode ? "text-gray-200" : "text-gray-800";
  };

  // Group rooms by floor for display
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {});

  const renderConfigurationStep = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onConfigurationSubmit}
      initialValues={{
        floors: 1,
        roomsPerFloor: [1],
        numberingFormat: "floor_room",
      }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label={<Text strong>Number of Floors</Text>}
            name="floors"
            rules={[
              { required: true, message: "Please enter number of floors" },
            ]}
          >
            <InputNumber
              min={1}
              max={50}
              className="w-full"
              onChange={(value) => {
                const currentValues = form.getFieldsValue();
                const newRoomsPerFloor = new Array(value).fill(1);
                const newRoomTypes = new Array(value).fill(roomTypes[0]?._id);

                form.setFieldsValue({
                  roomsPerFloor: newRoomsPerFloor,
                  roomTypes: newRoomTypes,
                });
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<Text strong>Room Numbering Format</Text>}
            name="numberingFormat"
            rules={[
              { required: true, message: "Please select numbering format" },
            ]}
          >
            <Select>
              {numberingFormats.map((format) => (
                <Select.Option key={format.value} value={format.value}>
                  {format.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Form.Item dependencies={["floors"]}>
        {({ getFieldValue }) => {
          const floors = getFieldValue("floors") || 1;
          return (
            <div>
              <Text strong>Floor Configuration</Text>
              <Row gutter={16} className="mt-4">
                {Array.from({ length: floors }, (_, index) => (
                  <Col span={24} key={index} className="mb-4">
                    <Card
                      size="small"
                      title={`Floor ${index + 1}`}
                      className={getCardClasses()}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            label="Rooms Count"
                            name={["roomsPerFloor", index]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber min={1} max={100} className="w-full" />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item
                            label="Room Type"
                            name={["roomTypes", index]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Select placeholder="Select room type">
                              {roomTypes.map((type) => (
                                <Select.Option key={type._id} value={type._id}>
                                  {type.typeName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        }}
      </Form.Item>
    </Form>
  );

  const renderReviewStep = () => (
    <div>
      {/* Error Summary */}
      {duplicateRooms.size > 0 && (
        <Alert
          message="Duplicate Room Numbers Found"
          description={`Please fix the following duplicate room numbers: ${Array.from(
            duplicateRooms
          ).join(", ")}`}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* Bulk Edit Controls */}
      <Card className={`${getCardClasses()} mb-4`}>
        <Title level={5}>Bulk Edit ({selectedRooms.length} selected)</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Select
              placeholder="Change room type"
              className="w-full"
              onChange={(value) => handleBulkUpdate("roomTypeId", value)}
            >
              {roomTypes.map((type) => (
                <Select.Option key={type._id} value={type._id}>
                  {type.typeName}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Input
              placeholder="Set description"
              onBlur={(e) => handleBulkUpdate("description", e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                handleBulkUpdate("image", file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<CameraOutlined />}>Set Image</Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      {/* Rooms by Floor */}
      <Collapse defaultActiveKey={Object.keys(roomsByFloor)}>
        {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
          <Panel
            key={floor}
            header={
              <div className="flex items-center justify-between">
                <Text strong>
                  Floor {floor} ({floorRooms.length} rooms)
                </Text>
                <Checkbox
                  checked={floorRooms.every((room) =>
                    selectedRooms.includes(room.id)
                  )}
                  indeterminate={
                    floorRooms.some((room) =>
                      selectedRooms.includes(room.id)
                    ) &&
                    !floorRooms.every((room) => selectedRooms.includes(room.id))
                  }
                  onChange={(e) =>
                    handleFloorSelection(parseInt(floor), e.target.checked)
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  Select All
                </Checkbox>
              </div>
            }
          >
            <Row gutter={16}>
              {floorRooms.map((room) => (
                <Col span={12} key={room.id} className="mb-4">
                  <Card
                    size="small"
                    className={`${getCardClasses()} ${
                      room.hasError ? "border-red-500" : ""
                    }`}
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedRooms.includes(room.id)}
                            onChange={(e) =>
                              handleRoomSelection(room.id, e.target.checked)
                            }
                          />
                          <Text className="ml-2">{room.roomNumber}</Text>
                          {room.hasError && (
                            <ExclamationCircleOutlined className="text-red-500 ml-2" />
                          )}
                        </div>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setEditingRoom(room.id)}
                        />
                      </div>
                    }
                  >
                    {room.hasError && (
                      <Alert
                        message={room.errorMessage}
                        type="error"
                        size="small"
                        className="mb-2"
                      />
                    )}

                    <div className="space-y-2">
                      <div>
                        <Text type="secondary">Room Type:</Text>
                        <Text className="ml-2">
                          {roomTypes.find((t) => t._id === room.roomTypeId)
                            ?.typeName || "Not selected"}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">Description:</Text>
                        <Text className="ml-2">
                          {room.description || "No description"}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">Image:</Text>
                        <Text className="ml-2">
                          {room.image ? "Uploaded" : "Not uploaded"}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Panel>
        ))}
      </Collapse>

      {/* Edit Room Modal */}
      <Modal
        title={`Edit Room ${
          editingRoom ? rooms.find((r) => r.id === editingRoom)?.roomNumber : ""
        }`}
        open={editingRoom !== null}
        onCancel={() => setEditingRoom(null)}
        footer={null}
        width={600}
      >
        {editingRoom &&
          (() => {
            const room = rooms.find((r) => r.id === editingRoom);
            return (
              <div className="space-y-4">
                <div>
                  <Text strong>Room Number:</Text>
                  <Input
                    value={room.roomNumber}
                    onChange={(e) =>
                      handleRoomUpdate(
                        editingRoom,
                        "roomNumber",
                        e.target.value
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Text strong>Room Type:</Text>
                  <Select
                    value={room.roomTypeId}
                    onChange={(value) =>
                      handleRoomUpdate(editingRoom, "roomTypeId", value)
                    }
                    className="w-full mt-1"
                  >
                    {roomTypes.map((type) => (
                      <Select.Option key={type._id} value={type._id}>
                        {type.typeName}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Text strong>Description:</Text>
                  <Input.TextArea
                    value={room.description}
                    onChange={(e) =>
                      handleRoomUpdate(
                        editingRoom,
                        "description",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Text strong>Image:</Text>
                  <Upload
                    accept="image/*"
                    beforeUpload={(file) => {
                      handleRoomUpdate(editingRoom, "image", file);
                      return false;
                    }}
                    showUploadList={false}
                    className="mt-1"
                  >
                    <Button icon={<CameraOutlined />}>
                      {room.image ? "Change Image" : "Upload Image"}
                    </Button>
                  </Upload>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between mb-4 ml-2">
        <Button
          title={t("roomManagement.bulkAddRoom.button.bulkAddRoom")}
          btnAdd
          size="large"
          onClick={() => setVisible(true)}
        />
      </div>

      <Modal
        confirmLoading={loadingSubmit}
        title={
          step === 1
            ? "Bulk Add Rooms - Configuration"
            : "Bulk Add Rooms - Review"
        }
        onCancel={onCancel}
        open={visible}
        width={step === 1 ? 800 : 1200}
        footer={
          <div className="flex justify-between">
            <div>
              {step === 2 && (
                <Button onClick={() => setStep(1)}>
                  Back to Configuration
                </Button>
              )}
            </div>
            <div>
              <Button onClick={onCancel} className="mr-2">
                Cancel
              </Button>
              {step === 1 ? (
                <Button type="primary" onClick={() => form.submit()}>
                  Generate Rooms
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={onBulkSubmit}
                  loading={loadingSubmit}
                  disabled={rooms.some((room) => room.hasError)}
                >
                  Create All Rooms ({rooms.length})
                </Button>
              )}
            </div>
          </div>
        }
        destroyOnClose
      >
        {step === 1 ? renderConfigurationStep() : renderReviewStep()}
      </Modal>
    </div>
  );
}

export default BulkAddRoom;
