import React, { useState } from "react";
import { Form, Input, InputNumber, Modal, DatePicker } from "antd";
import { Button } from "@/component";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { createRoomAdditionFee } from "@/api/roomAdditionFee";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function AddFee({ roomId, onAdd }) {
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal handlers
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Form submission
  const handleSubmit = async (values) => {
    if (!roomId) {
      toast.error(t("roomAdditionFee.messages.error.noRoomId"));
      return;
    }

    try {
      setLoading(true);

      // Extract month and year from DatePicker value
      const selectedDate = values.monthYear;
      const month = selectedDate.month() + 1; // dayjs months are 0-indexed
      const year = selectedDate.year();

      const feeData = {
        roomId: roomId,
        feeName: values.feeName.trim(),
        feeAmount: values.feeAmount,
        month: month,
        year: year,
        // Alternative: send as specific month/year object
        specificMonthYear: [
          {
            month: month,
            year: year,
          },
        ],
      };

      await createRoomAdditionFee(feeData);
      toast.success(t("roomAdditionFee.messages.success.feeAdded"));

      // Reset form and close modal
      form.resetFields();
      setIsModalVisible(false);

      // Refresh parent data
      if (onAdd) {
        onAdd();
      }
    } catch (error) {
      console.error("Error adding fee:", error);
      toast.error(
        error.response?.data?.message ||
          t("roomAdditionFee.messages.error.feeAdded")
      );
    } finally {
      setLoading(false);
    }
  };

  // Style helpers
  const getModalClasses = () => {
    return darkMode
      ? "[&_.ant-modal-content]:bg-gray-800 [&_.ant-modal-header]:bg-gray-800 [&_.ant-modal-header]:border-gray-700 [&_.ant-modal-title]:text-gray-200"
      : "";
  };

  const getFormItemClasses = () => {
    return darkMode
      ? "[&_.ant-form-item-label>label]:text-gray-200 [&_.ant-form-item-explain-error]:text-red-400"
      : "";
  };

  const getInputClasses = () => {
    return darkMode
      ? "[&_.ant-input]:bg-gray-700 [&_.ant-input]:border-gray-600 [&_.ant-input]:text-gray-200 [&_.ant-input]:placeholder-gray-400 [&_.ant-input-number]:bg-gray-700 [&_.ant-input-number]:border-gray-600 [&_.ant-input-number-input]:text-gray-200 [&_.ant-picker]:bg-gray-700 [&_.ant-picker]:border-gray-600 [&_.ant-picker-input>input]:text-gray-200 [&_.ant-picker-input>input]:placeholder-gray-400"
      : "";
  };

  return (
    <>
      <div className="mb-6">
        <Button
          btnAdd
          onClick={showModal}
          title={t("roomAdditionFee.buttons.addFee")}
        />
      </div>
      <Modal
        title={
          <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
            {t("roomAdditionFee.modal.addFee.title")}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        className={getModalClasses()}
        destroyOnClose
      >
        <div className={darkMode ? "bg-gray-800" : "bg-white"}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={`${getFormItemClasses()} ${getInputClasses()}`}
            preserve={false}
          >
            <Form.Item
              name="feeName"
              label={t("roomAdditionFee.form.feeName")}
              rules={[
                {
                  required: true,
                  message: t("roomAdditionFee.validation.feeName.required"),
                },
                {
                  min: 2,
                  message: t("roomAdditionFee.validation.feeName.minLength"),
                },
                {
                  max: 100,
                  message: t("roomAdditionFee.validation.feeName.maxLength"),
                },
                {
                  pattern:
                    /^[a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F\u1EA0-\u1EF9]+$/,
                  message: t("roomAdditionFee.validation.feeName.pattern"),
                },
              ]}
            >
              <Input
                placeholder={t("roomAdditionFee.placeholder.feeName")}
                className="rounded-lg"
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="feeAmount"
              label={t("roomAdditionFee.form.feeAmount")}
              rules={[
                {
                  required: true,
                  message: t("roomAdditionFee.validation.feeAmount.required"),
                },
                {
                  type: "number",
                  min: 0,
                  message: t("roomAdditionFee.validation.feeAmount.min"),
                },
                {
                  type: "number",
                  max: 999999999,
                  message: t("roomAdditionFee.validation.feeAmount.max"),
                },
              ]}
            >
              <InputNumber
                placeholder={t("roomAdditionFee.placeholder.feeAmount")}
                className="w-full rounded-lg"
                min={0}
                max={999999999}
                precision={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                addonAfter="VND"
              />
            </Form.Item>

            <Form.Item
              name="monthYear"
              label={t("roomAdditionFee.form.monthYear")}
              rules={[
                {
                  required: true,
                  message: t("roomAdditionFee.validation.monthYear.required"),
                },
              ]}
            >
              <DatePicker
                picker="month"
                placeholder={t("roomAdditionFee.placeholder.monthYear")}
                className="w-full rounded-lg"
                format="MM/YYYY"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("month");
                }}
                showToday={false}
                allowClear={false}
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-6">
              <div className="flex justify-end space-x-3">
                <Button
                  btnCancel
                  title={t("roomAdditionFee.buttons.cancel")}
                  onClick={handleCancel}
                  disabled={loading}
                />
                <Button
                  btnAdd
                  loading={loading}
                  title={t("roomAdditionFee.buttons.add")}
                  onClick={() => form.submit()}
                />
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default AddFee;
