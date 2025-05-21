import { useState, useEffect } from "react";
import { Modal, Form, Select, DatePicker, Input, Button, Spin } from "antd";
import {
  getOwnerAppointmentById,
  createAppointment,
  getAppointmentOfUser,
} from "../../../api/appointment";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useCurrentUser } from "../../../context/userContext";
import { useNavigate } from "react-router-dom";
import userRoles from "@/constants/userRole";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

dayjs.extend(utc);
dayjs.extend(timezone);

function CreateAppointmentForm({ ownerId, listRoomData }) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [ownerAppointment, setOwnerAppointment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userAppointment, setUsrAppointment] = useState([]);
  const { t } = useTranslation("boardingHouseDetail");
  const { darkMode } = useTheme();

  const { isLogin, hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);
  const navigate = useNavigate();

  const handleOpen = () => {
    if (!isLogin) {
      Modal.confirm({
        title: t("createAppointment.loginRequired"),
        content: t("createAppointment.loginMessage"),
        okText: t("createAppointment.login"),
        cancelText: t("createAppointment.cancel"),
        onOk: () => navigate("/login"),
        className: darkMode ? "ant-modal-dark" : "",
      });
      return;
    }
    setVisible(true);
  };

  const handleClose = () => {
    form.resetFields();
    setVisible(false);
  };

  const fetchOwnerAppointment = async () => {
    if (!ownerId) {
      console.log("can not get owner id");
      return;
    }
    setLoading(true);
    try {
      const res = await getOwnerAppointmentById(ownerId);
      if (res) {
        setOwnerAppointment(
          res.map((appt) =>
            dayjs.utc(appt.appointmentDate).tz("Asia/Ho_Chi_Minh")
          )
        );
      }
    } catch (error) {
      toast.error(t("createAppointment.fetchError") + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataUserAppointment = async () => {
    try {
      const res = await getAppointmentOfUser();
      setUsrAppointment(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerAppointment();
    fetchDataUserAppointment();
  }, []);

  //Disable time
  const isDisabledDate = (current) => {
    if (!current) return false;

    const today = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
    const selectedDay = dayjs(current).tz("Asia/Ho_Chi_Minh").startOf("day");

    if (selectedDay.isBefore(today) || selectedDay.isSame(today, "day")) {
      return true;
    }

    const appointmentCount = ownerAppointment.filter((appt) =>
      appt.isSame(selectedDay, "day")
    ).length;

    return appointmentCount >= 5;
  };

  const isDisabledTime = (selectedDate) => {
    if (!selectedDate) return {};
    const selectedDay = selectedDate.startOf("day");
    const bookedHours = ownerAppointment
      .filter((appt) => appt.startOf("day").isSame(selectedDay, "day"))
      .map((appt) => appt.get("hour"));

    return {
      disabledHours: () =>
        Array.from({ length: 24 }, (_, i) => i).filter(
          (h) => h < 6 || h >= 18 || bookedHours.includes(h)
        ),
      disabledMinutes: (hour) =>
        bookedHours.includes(hour)
          ? Array.from({ length: 60 }, (_, i) => i)
          : [],
    };
  };

  const handleCreateAppointment = async (values) => {
    setSubmitting(true);

    try {
      const appointmentDate = dayjs(values.appointmentDate)
        .tz("Asia/Ho_Chi_Minh", true)
        .utc()
        .toISOString();

      const appointmentData = {
        roomId: values.roomId,
        appointmentDate: appointmentDate,
        note: values.note || "",
      };

      if (userAppointment.length > 0) {
        const hasSameRoom = userAppointment.some(
          (appt) =>
            appt.roomId === appointmentData.roomId &&
            (appt.status === "pending" || appt.status === "confirmed")
        );

        if (hasSameRoom) {
          toast.error(t("createAppointment.sameRoomError"));
          return;
        }
      }

      const isWithin30Minutes = (existingDate, newDate) => {
        const diff = Math.abs(new Date(existingDate) - new Date(newDate));
        return diff <= 30 * 60 * 1000; // 30 minutes in milliseconds
      };

      if (userAppointment.length > 0) {
        const hasConflict = userAppointment
          .filter(
            (appt) => appt.status === "pending" || appt.status === "confirmed"
          )
          .some((appt) =>
            isWithin30Minutes(
              appt.appointmentDate,
              appointmentData.appointmentDate
            )
          );

        if (hasConflict) {
          toast.error(t("createAppointment.timeConflictError"));
          return;
        }
      }

      await createAppointment(appointmentData);
      fetchOwnerAppointment();
      fetchDataUserAppointment();
      toast.success(t("createAppointment.requestSuccess"));
      handleClose();
      navigate("/my-appointment");
    } catch (error) {
      toast.error(t("createAppointment.requestError") + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const modalClasses = darkMode ? "ant-modal-dark" : "";

  // CSS styles for dark mode text input with lighter colors
  const textAreaStyle = darkMode
    ? {
        backgroundColor: "#2d2d2d",
        color: "#e0e0e0",
        borderColor: "#525252",
        // Added styles for placeholder
        "&::placeholder": {
          color: "#999999",
        },
      }
    : {};

  // Define dark mode styles for Select and DatePicker
  const selectStyle = darkMode
    ? {
        backgroundColor: "#2d2d2d",
        color: "#e0e0e0",
        borderColor: "#525252",
      }
    : {};

  const datePickerStyle = darkMode
    ? {
        width: "100%",
        backgroundColor: "#2d2d2d",
        color: "#e0e0e0",
        borderColor: "#525252",
      }
    : { width: "100%" };

  // Define a class to target the placeholder and other elements specifically
  useEffect(() => {
    if (darkMode) {
      const style = document.createElement("style");
      style.id = "dark-mode-components-style";
      style.innerHTML = `
        /* Input placeholders */
        .ant-input-dark::placeholder {
          color: #999999 !important;
        }
        .ant-input-dark::-webkit-input-placeholder {
          color: #999999 !important;
        }
        .ant-input-dark::-moz-placeholder {
          color: #999999 !important;
        }
        .ant-input-dark:-ms-input-placeholder {
          color: #999999 !important;
        }
        
        /* Select component dark mode */
        .ant-select-dark .ant-select-selector {
          background-color: #2d2d2d !important;
          border-color: #525252 !important;
          color: #e0e0e0 !important;
        }
        .ant-select-dark .ant-select-selection-placeholder {
          color: #999999 !important;
        }
        .ant-select-dark .ant-select-arrow {
          color: #e0e0e0 !important;
        }
        .ant-select-dropdown-dark {
          background-color: #2d2d2d !important;
        }
        .ant-select-dropdown-dark .ant-select-item {
          color: #e0e0e0 !important;
        }
        .ant-select-dropdown-dark .ant-select-item-option-selected {
          background-color: #3a3a3a !important;
        }
        .ant-select-dropdown-dark .ant-select-item-option-active {
          background-color: #464646 !important;
        }
        
        /* DatePicker component dark mode */
        .ant-picker-dark {
          background-color: #2d2d2d !important;
          border-color: #525252 !important;
        }
        .ant-picker-dark input {
          color: #e0e0e0 !important;
        }
        .ant-picker-dark .ant-picker-suffix {
          color: #e0e0e0 !important;
        }
        .ant-picker-dark .ant-picker-clear {
          background-color: #2d2d2d !important;
          color: #999999 !important;
        }
        .ant-picker-panel-dark {
          background-color: #2d2d2d !important;
          color: #e0e0e0 !important;
        }
        .ant-picker-panel-dark .ant-picker-header {
          color: #e0e0e0 !important;
          border-color: #525252 !important;
        }
        .ant-picker-panel-dark .ant-picker-header button {
          color: #e0e0e0 !important;
        }
        .ant-picker-panel-dark .ant-picker-cell {
          color: #e0e0e0 !important;
        }
        .ant-picker-panel-dark .ant-picker-cell-disabled {
          color: #606060 !important;
        }
        .ant-picker-panel-dark .ant-picker-cell-selected .ant-picker-cell-inner {
          background-color: #1890ff !important;
        }
        .ant-picker-panel-dark .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
          background-color: #1890ff !important;
        }
        .ant-picker-panel-dark .ant-picker-time-panel {
          background-color: #2d2d2d !important;
        }
        .ant-picker-panel-dark .ant-picker-footer {
          border-color: #525252 !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById(
          "dark-mode-components-style"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [darkMode]);

  return (
    <>
      <Button
        disabled={isOwner || listRoomData?.length == 0}
        onClick={handleOpen}
        size="large"
        className={`${
          darkMode ? "bg-red-500" : "bg-red-400"
        } md:min-w-[200px] text-white py-2 px-4 rounded-xl hover:opacity-90`}
      >
        {loading ? <Spin size="small" /> : t("createAppointment.buttonText")}
      </Button>

      <Modal
        title={t("createAppointment.modalTitle")}
        open={visible}
        onCancel={handleClose}
        footer={null}
        className={modalClasses}
        closeIcon={
          <span className={darkMode ? "text-white" : ""}>&times;</span>
        }
      >
        {loading ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateAppointment}
            className={darkMode ? "text-white" : ""}
          >
            <Form.Item
              name="roomId"
              label={t("createAppointment.selectRoom")}
              rules={[
                {
                  required: true,
                  message: t("createAppointment.roomRequired"),
                },
              ]}
            >
              <Select
                placeholder={t("createAppointment.roomPlaceholder")}
                className={darkMode ? "ant-select-dark" : ""}
                style={selectStyle}
                dropdownClassName={darkMode ? "ant-select-dropdown-dark" : ""}
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {listRoomData.map((room) => (
                  <Select.Option key={room._id} value={room._id}>
                    {room.roomNumber}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="appointmentDate"
              label={t("createAppointment.dateTime")}
              rules={[
                {
                  required: true,
                  message: t("createAppointment.dateTimeRequired"),
                },
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={datePickerStyle}
                disabledDate={isDisabledDate}
                disabledTime={isDisabledTime}
                className={darkMode ? "ant-picker-dark" : ""}
                popupClassName={darkMode ? "ant-picker-panel-dark" : ""}
                getPopupContainer={(trigger) => trigger.parentNode}
              />
            </Form.Item>

            <Form.Item name="note" label={t("createAppointment.note")}>
              <Input.TextArea
                placeholder={t("createAppointment.notePlaceholder")}
                className={darkMode ? "ant-input-dark" : ""}
                style={textAreaStyle}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={submitting}
                className={darkMode ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                {submitting ? (
                  <Spin size="small" />
                ) : (
                  t("createAppointment.submit")
                )}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

export default CreateAppointmentForm;
