import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Select, Space, Row, Col, Typography } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getRoomTypeByBhId,
  updateRoom,
} from "@/api/ownerUser/boardingHouseAPI";

import { Button, ConfirmModal } from "@/component";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import RoomAdditionFeeList from "./RoomAdditionFeeList"; // Import the new component
import "./updateRoom.css"; // Import custom styles if needed
import DefaulImage from "@/assets/images/blankRoom.jpg";

const { Text } = Typography;

function UpdateRoomPage({
  boardingHouseId,
  refreshRoomData,
  roomData,
  onBack,
  onUpdate,
  onDelete,
}) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  // Ref to hold the refresh function from RoomAdditionFeeList
  const [refreshFeesData, setRefreshFeesData] = useState(null);

  // ============ FORM HANDLERS ============
  const onFinish = async (values) => {
    if (fileList.length === 0) {
      toast.error(t("roomManagement.updateRoom.pleaseUploadImage"));
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
      const res = await updateRoom(roomData._id, formData);
      refreshRoomData();
      toast.success(res.message);
      if (onBack) {
        onBack();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const onCancel = () => {
    form.resetFields();
    setFileList([]);
    if (onBack) {
      onBack();
    }
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList.slice(-1));
  };

  // ============ DATA FETCHING ============
  const fetchRoomTypes = async () => {
    try {
      const res = await getRoomTypeByBhId(boardingHouseId);
      setRoomTypes(res.data);
      if (res.data.length === 0) {
        toast.error(t("roomManagement.updateRoom.noRoomTypeFound"));
        if (onBack) {
          onBack();
        }
      }
    } catch (error) {
      toast.error(t("roomManagement.updateRoom.errorFetchingRoomTypes"));
      console.log(error);
    }
  };

  const loadRoomImage = async () => {
    try {
      const res = await fetch(roomData.images.imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "room_image.jpg", { type: blob.type });

      setFileList([
        {
          uid: "-1",
          name: "room_image.jpg",
          status: "done",
          url: roomData.images.imageUrl,
          originFileObj: file,
        },
      ]);
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };

  // ============ EFFECTS ============
  useEffect(() => {
    fetchRoomTypes();
    if (roomData && roomData.images) {
      loadRoomImage();
    }
  }, []);

  // ============ STYLE HELPERS ============
  const getContentBgClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getTextColor = () => {
    return darkMode ? "text-gray-200" : "text-gray-800";
  };

  const getImageContainerClasses = () => {
    return darkMode
      ? "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600"
      : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300";
  };

  // ============ MODAL HANDLERS ============
  const handleToggleConfirmDelete = () => {
    setIsOpenDeleteModal(!isOpenDeleteModal);
  };

  // ============ CALLBACK HANDLERS ============
  const handleFeesRefresh = (refreshFn) => {
    setRefreshFeesData(() => refreshFn);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 p-6">
      <div className="w-full h-full">
        {/* Header với nút back */}
        <div className="mb-6">
          <Button
            onClick={onCancel}
            title={t("roomManagement.updateRoom.backToRoomManagement")}
            size="large"
            btnBack
          />
        </div>

        <Row gutter={[20, 20]} align="stretch">
          {/* Left Column - Image */}
          <Col xs={24} lg={10}>
            <div
              className={`${getImageContainerClasses()} rounded-xl h-[435px] flex items-center justify-center relative overflow-hidden border-2 border-dashed transition-all duration-300`}
            >
              {fileList.length > 0 ? (
                <img
                  src={
                    fileList[0].url ||
                    URL.createObjectURL(fileList[0].originFileObj)
                  }
                  alt="Room"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <CameraOutlined
                    className={`text-7xl mb-6 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <Text
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } font-medium text-center`}
                  >
                    {t("roomManagement.updateRoom.clickToUploadImage")}
                  </Text>
                  <Text
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-base mt-3 text-center`}
                  >
                    {t("roomManagement.updateRoom.imageFileFormat")}
                  </Text>
                </div>
              )}

              {/* Upload overlay */}
              <Upload
                fileList={[]}
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleChange}
                showUploadList={false}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                    <CameraOutlined className="text-3xl text-blue-600" />
                  </div>
                </div>
              </Upload>
            </div>
          </Col>

          {/* Right Column - Form */}
          <Col xs={24} lg={14}>
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              initialValues={
                roomData && {
                  roomType: roomData.roomTypeId._id,
                  roomNumber: roomData.roomNumber,
                  description: roomData.description,
                }
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.roomType")}
                    </Text>
                  }
                  name="roomType"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseSelectRoomType"
                      ),
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder={t("roomManagement.updateRoom.selectRoomType")}
                    className={`rounded-lg h-16  ${
                      darkMode
                        ? "[&_.ant-select-selector]:bg-gray-700 [&_.ant-select-selector]:border-gray-600 [&_.ant-select-selector]:text-gray-200"
                        : ""
                    }`}
                  >
                    {roomTypes.map((roomType) => (
                      <Select.Option key={roomType._id} value={roomType._id}>
                        <span className="">{roomType.typeName}</span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.roomNumber")}
                    </Text>
                  }
                  name="roomNumber"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseEnterRoomNumber"
                      ),
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder={t("roomManagement.updateRoom.enterRoomNumber")}
                    className={`rounded-lg h-16  ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.description")}
                    </Text>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseEnterRoomDescription"
                      ),
                    },
                  ]}
                >
                  <Input.TextArea
                    size="large"
                    placeholder={t(
                      "roomManagement.updateRoom.enterDetailedRoomDescription"
                    )}
                    autoSize={{ minRows: 6, maxRows: 8 }}
                    className={`rounded-lg  p-4 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>
              </Space>
            </Form>
          </Col>

          {/* Action Buttons */}
          <Col xs={24} sm={12}>
            <Button
              btnDelete
              title={t("roomManagement.updateRoom.deleteRoom")}
              size="large"
              className="w-full"
              onClick={handleToggleConfirmDelete}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Button
              btnUpdate
              title={t("roomManagement.updateRoom.updateRoom")}
              size="large"
              loading={loadingSubmit}
              onClick={() => form.submit()}
              className="w-full"
            />
          </Col>

          {/* Room Addition Fees List - Now as a separate component */}
          <Col xs={24}>
            <RoomAdditionFeeList
              roomId={roomData?._id}
              onRefresh={handleFeesRefresh}
            />
          </Col>
        </Row>
      </div>

      <ConfirmModal
        title={t("roomAdditionFee.modal.deleteFee.title")}
        content={t("roomAdditionFee.messages.warning.deleteConfirmation")}
        onOk={() => {
          onDelete(roomData._id);
          setIsOpenDeleteModal(false);
        }}
        onCancel={() => {
          setIsOpenDeleteModal(false);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default UpdateRoomPage;
