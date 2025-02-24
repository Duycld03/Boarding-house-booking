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

dayjs.extend(utc);
dayjs.extend(timezone);

function CreateAppointmentForm({ ownerId, listRoomData }) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [ownerAppointment, setOwnerAppointment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userAppointment, setUsrAppointment] = useState([]);

  const { isLogin } = useCurrentUser();
  const navigate = useNavigate();

  const handleOpen = () => {
    if (!isLogin) {
      Modal.confirm({
        title: " You need to log in",
        content: "Please log in to create an appointment.",
        okText: " Log in",
        cancelText: "Cancel",
        onOk: () => navigate("/login"),
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
      toast.error(" Unable to retrieve appointments: " + error.message);
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

    console.log(
      `Ngày ${selectedDay.format("YYYY-MM-DD")} có ${appointmentCount} cuộc hẹn`
    );

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
          toast.error("You cannot book an appointment in the same room!");
          return;
        }
      }

      const isWithin30Minutes = (existingDate, newDate) => {
        const diff = Math.abs(new Date(existingDate) - new Date(newDate));
        return diff <= 30 * 60 * 1000; // 30 minutes in milliseconds
      };

      if (userAppointment.length > 0) {
        const hasConflict = userAppointment.some((appt) =>
          isWithin30Minutes(
            appt.appointmentDate,
            appointmentData.appointmentDate
          )
        );

        if (hasConflict) {
          toast.error(
            "Appointments cannot be booked within 30 minutes before or after an existing appointment!"
          );
          return;
        }
      }

      await createAppointment(appointmentData);
      fetchOwnerAppointment();
      fetchDataUserAppointment();
      toast.success("Đã gửi yêu cầu thành công!");
      handleClose();
    } catch (error) {
      toast.error("Lỗi khi gửi yêu cầu: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        disabled={listRoomData?.length > 0 ? false : true}
        onClick={handleOpen}
        size="large"
        className="bg-red-400 md:min-w-[200px] text-white py-2 px-4 rounded-xl"
      >
        {loading ? <Spin size="small" /> : "Make appointment"}
      </Button>

      <Modal
        title="Create a room viewing request"
        open={visible}
        onCancel={handleClose}
        footer={null}
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
          >
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
              name="appointmentDate"
              label="Date & Time"
              rules={[
                { required: true, message: "Please select a date & time" },
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                disabledDate={isDisabledDate}
                disabledTime={isDisabledTime}
              />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea placeholder="Enter note (optional)" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={submitting}>
                {submitting ? <Spin size="small" /> : "Submit request"}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

export default CreateAppointmentForm;
