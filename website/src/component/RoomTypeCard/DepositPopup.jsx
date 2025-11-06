import {
  Form,
  Modal,
  InputNumber,
  Select,
  DatePicker,
  ConfigProvider,
  theme,
} from "antd";
import React, { useState } from "react";
import formatAmount from "../../utils/formatAmount";
import { depositRoom } from "../../api/depositAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const { RangePicker } = DatePicker;

function DepositPopup({ visible, toggleVisible, roomData, listRoomData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([dayjs(), dayjs().add(1, "month")]);
  const { t } = useTranslation("depositPopup");
  const { darkMode } = useTheme();

  const onCancel = () => {
    form.resetFields();
    toggleVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await depositRoom(values);
      toast.success(t("successMessage"));
    } catch (error) {
      toast.warning(error?.response?.data?.message);
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day").add(7, "days");
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

  // Phải bọc bằng ConfigProvider để áp dụng dark mode cho các component của Ant Design
  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#ff7a45", // Màu chính từ giao diện hiện tại
        },
      }}
    >
      <Modal
        open={visible}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText={t("okText")}
        cancelText={t("cancel")}
        onCancel={onCancel}
        destroyOnClose
        className="dark:bg-background-dark"
        rootClassName="dark:bg-background-dark"
        title={
          <h1 className="text-2xl font-semibold dark:text-text-dark">
            {t("title")}
          </h1>
        }
      >
        <div className="dark:bg-background-dark dark:text-text-dark">
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
            }}
            className="dark:text-text-dark"
          >
            <Form.Item name="price" className="mb-2" hidden>
              <p className="text-3xl text-orange-500 font-semibold">
                {formatAmount(roomData?.price)} (VND)/ month
              </p>
            </Form.Item>
            <Form.Item
              name="roomId"
              label={
                <span className="dark:text-text-dark">{t("selectRoom")}</span>
              }
              rules={[{ required: true, message: t("selectRoomRequired") }]}
            >
              <Select
                placeholder={t("selectRoom")}
                className="dark:bg-background-dark dark:text-text-dark"
              >
                {listRoomData.map((room) => (
                  <Select.Option key={room._id} value={room._id}>
                    {room.roomNumber}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span className="dark:text-text-dark">{t("rentalDate")}</span>
              }
              name="rentalDate"
              className="mb-8"
              rules={[{ required: true }]}
            >
              <RangePicker
                disabledDate={disabledDate}
                onChange={handleRentalDateChange}
                format={"DD/MM/YYYY"}
                disabled={[false, true]}
                allowEmpty={[false, true]}
                onClick={() => form.setFieldsValue({ rentalDate: [] })}
                className="dark:bg-background-dark dark:text-text-dark w-full"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="dark:text-text-dark">{t("rentalTime")}</span>
              }
              className="mb-2"
              required
            >
              <div className="flex space-x-2">
                <Form.Item
                  name="rentalTime"
                  className="w-full"
                  rules={[
                    { required: true, message: t("rentalTimeRequired") },
                    {
                      type: "number",
                      min: 1,
                      message: t("rentalTimeMin"),
                    },
                  ]}
                >
                  <InputNumber
                    placeholder={t("enterRentalTime")}
                    className="w-full dark:bg-background-dark dark:text-text-dark"
                    onChange={handleRentalTimeChange}
                  />
                </Form.Item>
                <Form.Item name="timeType" className="w-[30%]" required>
                  <Select
                    placeholder={t("selectTimeType")}
                    onChange={handleRentalTypeChange}
                    rules={[{ required: true }]}
                    className="dark:bg-background-dark dark:text-text-dark"
                  >
                    <Select.Option value="month">{t("month")}</Select.Option>
                    <Select.Option value="year">{t("year")}</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default DepositPopup;
