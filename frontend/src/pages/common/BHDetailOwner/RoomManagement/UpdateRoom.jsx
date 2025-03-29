import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getRoomTypeByBhId, updateRoom } from "@/api/ownerUser/boardingHouse";

function UpdateRoom({
  visible,
  setVisible,
  boardingHouseId,
  refreshRoomData,
  roomData,
}) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      toast.error("Please upload a room image.");
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
        title: "No room type found",
        content: "Please add room type before adding room",
        onOk: () => {
          setVisible(false);
        },
        cancelButtonProps: { style: { display: "none" } },
      });
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

  useEffect(() => {
    fetchRoomTypes();
    if (roomData && roomData.images) {
      loadRoomImage();
    }
  }, [visible]);

  return (
    <Modal
      confirmLoading={loadingSubmit}
      title="Update Room"
      onCancel={onCancel}
      open={visible}
      onOk={form.submit}
      okText="Update room"
      destroyOnClose
    >
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
        <Form.Item
          label="Room Type"
          name="roomType"
          rules={[{ required: true, message: "Please select room type!" }]}
        >
          <Select size="large" placeholder="Select room type">
            {roomTypes.map((roomType) => (
              <Select.Option key={roomType._id} value={roomType._id}>
                {roomType.typeName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Room Number"
          name="roomNumber"
          rules={[{ required: true, message: "Please enter room number!" }]}
        >
          <Input size="large" placeholder="Enter room number" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please enter room description!" },
          ]}
        >
          <Input.TextArea
            size="large"
            placeholder="Enter room description"
            autoSize={{ minRows: 3 }}
          />
        </Form.Item>

        <Form.Item label="Room Image" name="image">
          <Upload
            className="custom-upload"
            listType="picture-card"
            fileList={fileList}
            maxCount={1}
            accept="image/*"
            beforeUpload={() => false}
            onChange={handleChange}
            previewFile={(file) => {
              return Promise.resolve(URL.createObjectURL(file));
            }}
          >
            {fileList.length < 1 ? (
              <div className="flex flex-col items-center justify-center border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                <PlusOutlined className="text-2xl text-gray-400" />
                <p className="text-gray-500 mt-2 text-sm font-medium">
                  Add Image
                </p>
                <p className="text-gray-400 text-xs">
                  Drag-drop or click to upload
                </p>
              </div>
            ) : null}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpdateRoom;
