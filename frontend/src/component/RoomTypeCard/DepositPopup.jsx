import { Form, Modal, InputNumber, Select, Radio } from "antd";
import React, { useState } from "react";
import formatAmount from "../../utils/formatAmount";
import { depositRoom } from "../../api/depositManagement";
import { toast } from "react-toastify";

function DepositPopup({
  visible,
  toggleVisible,
  roomData,
  listRoomData,
  boardingHouse,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onCancel = () => {
    form.resetFields();
    toggleVisible(false);
  };
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = { boardingHouseId: boardingHouse._id, ...values };
      const res = await depositRoom(data);
      window.location.href = res.url;
    } catch (error) {
      toast.warning(error?.response?.data?.message);
    } finally {
      setLoading(false);
      onCancel();
    }
  };
  return (
    <Modal
      open={visible}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Deposit"
      onCancel={onCancel}
      destroyOnClose
    >
      <h1 className="text-3xl md:text-4xl font-semibold mb-4">
        {boardingHouse?.name}
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          roomType: roomData?.typeName,
          price: roomData?.price,
          rentalTime: 1,
          timeType: "month",
          payment: "vnpay",
        }}
      >
        <Form.Item name="roomType" className="mb-2">
          <p className="text-3xl">{roomData?.typeName}</p>
        </Form.Item>
        <Form.Item name="price" className="mb-2">
          <p className="text-3xl text-orange-500 font-semibold">
            {formatAmount(roomData?.price)} (VND)/ month
          </p>
        </Form.Item>
        <Form.Item
          name="roomId"
          label="Select a room"
          rules={[{ required: true, message: "Please select a room" }]}
        >
          <Select placeholder="Select a room">
            {listRoomData.map((room) => (
              <Select.Option key={room._id} value={room._id}>
                {room.roomNumber}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Rental time" className="mb-2" required>
          <div className="flex space-x-2">
            <Form.Item
              name="rentalTime"
              className="w-full"
              rules={[
                { required: true, message: "Please enter rental time" },
                {
                  type: "number",
                  min: 1,
                  message: "Rental time must be greater than 0",
                },
              ]}
            >
              <InputNumber placeholder="Enter rental time" className="w-full" />
            </Form.Item>
            <Form.Item name="timeType" className="w-[30%]" required>
              <Select
                placeholder="Select type of time"
                rules={[{ required: true }]}
              >
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="year">Year</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item name="payment" label="Payment method" required>
          <Radio.Group className="mb-2" rules={[{ required: true }]}>
            <Radio value="vnpay">VNPay</Radio>
            <Radio value="momo">Momo</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default DepositPopup;
