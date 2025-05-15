import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import {
  CustomDatePicker,
  CustomRadio,
  FormField,
} from "@/components/form/index";
import { sendOTPRegister } from "@/API/authManagement";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.fullname.trim()) {
      newErrors.fullname = { message: "Vui lòng nhập họ tên" };
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = { message: "Vui lòng nhập email" };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = { message: "Email không hợp lệ" };
        isValid = false;
      }
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = { message: "Vui lòng nhập số điện thoại" };
    } else if (formData.phoneNumber.length != 10) {
      newErrors.phoneNumber = { message: "Số điện thoại phải có 10 ký tự" };
    }

    if (!formData.username) {
      newErrors.username = { message: "Vui lòng nhập tên tài khoản" };
      isValid = false;
    } else if (formData.username.includes(" ")) {
      newErrors.username = {
        message: "Tên tài khoản không được chứa khoảng trắng",
      };
      isValid = false;
    } else if (formData.username.length < 5) {
      newErrors.username = { message: "Tên tài khoản phải có ít nhất 5 ký tự" };
      isValid = false;
    } else if (formData.username.length > 20) {
      newErrors.username = { message: "Tên tài khoản không được quá 20 ký tự" };
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = {
        message: "Tên tài khoản chỉ được chứa chữ cái và số",
      };
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = { message: "Vui lòng nhập mật khẩu" };
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = { message: "Mật khẩu phải có ít nhất 6 ký tự" };
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = { message: "Vui lòng xác nhận mật khẩu" };
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = { message: "Mật khẩu không khớp" };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const payload = { ...formData, gender };

    setLoading(true);
    try {
      const res = await sendOTPRegister(payload);
      showSuccess("Gửi mã OTP thành công");
      router.push({
        pathname: "/(auth)/verifyRegister",
        params: {
          account: JSON.stringify(res.account),
          token: res.token,
        },
      });
    } catch (error) {
      showError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const [gender, setGender] = useState("male");

  const radioOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
  ];

  return (
    <ScreenContainer>
      <BackHeader title="Register" animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text variant="h2" weight="bold" className="mt-4 mb-6">
          Tạo tài khoản mới
        </Text>

        <FormField
          name="fullname"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={formData.fullname}
          onChange={handleChange}
          error={errors}
          required
        />

        <FormField
          name="email"
          label="Email"
          placeholder="Nhập địa chỉ email"
          value={formData.email}
          onChange={handleChange}
          error={errors}
          inputType="email"
          required
        />

        <FormField
          name="phoneNumber"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors}
          inputType="phone"
          required
        />

        <FormField
          name="username"
          label="Tên tài khoản"
          placeholder="Nhập tên tài khoản"
          value={formData.username}
          onChange={handleChange}
          error={errors}
          required
        />

        <FormField
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={formData.password}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <FormField
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <CustomRadio
          label="Chọn giới tính"
          options={radioOptions}
          value={gender}
          onChange={setGender}
          required={true}
          direction="vertical"
          radioPosition="left"
        />

        <Button
          onPress={handleRegister}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          Đăng Ký
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
