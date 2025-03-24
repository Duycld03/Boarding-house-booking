import { Form, Modal, InputNumber, Select, Radio, DatePicker } from "antd";
import React, { useState } from "react";
import formatAmount from "../../utils/formatAmount";
import { depositRoom } from "../../api/depositManagement";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

function DepositPopup({
  visible,
  toggleVisible,
  roomData,
  listRoomData,
  boardingHouse,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([dayjs(), dayjs().add(1, "month")]);

  const onCancel = () => {
    form.resetFields();
    toggleVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await depositRoom(values);
      toast.success(res.message);
    } catch (error) {
      toast.warning(error?.response?.data?.message);
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleRentalTimeChange = (value) => {
    if (value <= 0) return;
    const timeType = form.getFieldValue("timeType");
    const rentalDate = form.getFieldValue("rentalDate");
    form.setFieldsValue({
      rentalDate: [rentalDate[0], rentalDate[0].add(value, timeType)],
    });
  };

  const handleRentalTypeChange = (value) => {
    const rentalTime = form.getFieldValue("rentalTime");
    const rentalDate = form.getFieldValue("rentalDate");
    form.setFieldsValue({
      rentalDate: [rentalDate[0], rentalDate[0].add(rentalTime, value)],
    });
  };

  const handleRentalDateChange = (dates) => {
    const timeType = form.getFieldValue("timeType");
    const rentalTime = form.getFieldValue("rentalTime");
    form.setFieldsValue({
      rentalDate: [dates[0], dates[0].add(rentalTime, timeType)],
    });
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
          rentalDate: dates,
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
        <Form.Item
          label="Rental date"
          name="rentalDate"
          className="mb-2"
          rules={[{ required: true }]}
        >
          <RangePicker
            disabledDate={disabledDate}
            onChange={handleRentalDateChange}
            format={"DD/MM/YYYY"}
            disabled={[false, true]}
            allowEmpty={[false, true]}
            onClick={() => form.setFieldsValue({ rentalDate: [] })}
          />
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
              <InputNumber
                placeholder="Enter rental time"
                className="w-full"
                onChange={handleRentalTimeChange}
              />
            </Form.Item>
            <Form.Item name="timeType" className="w-[30%]" required>
              <Select
                placeholder="Select type of time"
                onChange={handleRentalTypeChange}
                rules={[{ required: true }]}
              >
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="year">Year</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default DepositPopup;
