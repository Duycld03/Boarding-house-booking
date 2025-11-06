import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  DatePicker,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  updateRoomAdditionFee,
  deleteRoomAdditionFee,
} from "@/api/roomAdditionFee";
import dayjs from "dayjs";

import { Button } from "@/component"; // Assuming Button is a custom component

function UpdateFee({ feeData, visible, onClose, onUpdate }) {
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset form khi modal mở/đóng hoặc feeData thay đổi
  useEffect(() => {
    if (visible && feeData) {
      // Create dayjs object from existing month/year data
      let monthYearValue = null;
      if (feeData.month && feeData.year) {
        monthYearValue = dayjs()
          .month(feeData.month - 1)
          .year(feeData.year);
      } else if (
        feeData.specificMonthYear &&
        feeData.specificMonthYear.length > 0
      ) {
        const firstEntry = feeData.specificMonthYear[0];
        monthYearValue = dayjs()
          .month(firstEntry.month - 1)
          .year(firstEntry.year);
      }

      form.setFieldsValue({
        feeName: feeData.feeName,
        feeAmount: feeData.feeAmount,
        monthYear: monthYearValue,
      });
    } else {
      form.resetFields();
    }
  }, [visible, feeData, form]);

  // ============ UPDATE HANDLER ============
  const handleUpdate = useCallback(
    async (values) => {
      try {
        setLoading(true);

        // Extract month and year from DatePicker value
        const selectedDate = values.monthYear;
        const month = selectedDate.month() + 1; // dayjs months are 0-indexed
        const year = selectedDate.year();

        const updateData = {
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

        const response = await updateRoomAdditionFee(feeData._id, updateData);

        if (response) {
          toast.success(t("roomAdditionFee.messages.success.feeUpdated"));
          form.resetFields();
          onClose();

          if (onUpdate) {
            onUpdate();
          }
        } else {
          toast.error(t("roomAdditionFee.messages.error.feeUpdated"));
        }
      } catch (error) {
        console.error("Error updating fee:", error);
        toast.error(
          error.response?.data?.message ||
            t("roomAdditionFee.messages.error.feeUpdated")
        );
      } finally {
        setLoading(false);
      }
    },
    [feeData, form, onClose, onUpdate, t]
  );

  // ============ MODAL HANDLERS ============
  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  // ============ STYLING ============
  const getModalClasses = () => {
    return darkMode
      ? {
          className: "dark-modal",
          bodyStyle: {
            backgroundColor: "#1f2937",
            color: "#f9fafb",
          },
        }
      : {};
  };

  const getDatePickerClasses = () => {
    return darkMode
      ? "w-full [&_.ant-picker]:bg-gray-700 [&_.ant-picker]:border-gray-600 [&_.ant-picker-input>input]:text-gray-200 [&_.ant-picker-input>input]:placeholder-gray-400"
      : "w-full";
  };

  return (
    <Modal
      title={
        <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
          {t("roomAdditionFee.updateFee.title")}
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
      {...getModalClasses()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
        className="mt-4"
      >
        <Form.Item
          label={
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {t("roomAdditionFee.form.feeName")}
            </span>
          }
          name="feeName"
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
            className={
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                : ""
            }
          />
        </Form.Item>

        <Form.Item
          label={
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {t("roomAdditionFee.form.feeAmount")}
            </span>
          }
          name="feeAmount"
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
            min={0}
            max={999999999}
            step={1000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            placeholder={t("roomAdditionFee.placeholder.feeAmount")}
            className={
              darkMode
                ? "w-full [&_.ant-input-number-input]:bg-gray-700 [&_.ant-input-number-input]:border-gray-600 [&_.ant-input-number-input]:text-gray-200"
                : "w-full"
            }
          />
        </Form.Item>

        <Form.Item
          label={
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {t("roomAdditionFee.form.monthYear")}
            </span>
          }
          name="monthYear"
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
            className={getDatePickerClasses()}
            format="MM/YYYY"
            disabledDate={(current) => {
              // Disable dates before current month
              return current && current < dayjs().startOf("month");
            }}
            showToday={false}
            allowClear={false}
          />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <Space>
            {/* //Cancel Button */}
            <Button
              btnCancel
              title={t("roomAdditionFee.buttons.cancel")}
              onClick={handleCancel}
              disabled={loading}
            />
            <Button
              htmlType="submit"
              btnUpdate
              title={t("roomAdditionFee.buttons.edit")}
              loading={loading}
            />
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpdateFee;
