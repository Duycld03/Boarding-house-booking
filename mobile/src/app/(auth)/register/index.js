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
import { useTranslation } from "react-i18next";

export default function Register() {
  const router = useRouter();
  const { t } = useTranslation("register");
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
      newErrors.fullname = { message: t("fullnameError") };
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = { message: t("emailError") };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = { message: t("emailFormatError") };
        isValid = false;
      }
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = { message: t("phoneNumberError") };
    } else if (formData.phoneNumber.length != 10) {
      newErrors.phoneNumber = { message: t("phoneNumberLengthError") };
    }

    if (!formData.username) {
      newErrors.username = { message: t("usernameError") };
      isValid = false;
    } else if (formData.username.includes(" ")) {
      newErrors.username = {
        message: t("usernameSpaceError"),
      };
      isValid = false;
    } else if (formData.username.length < 5) {
      newErrors.username = { message: t("usernameLengthError") };
      isValid = false;
    } else if (formData.username.length > 20) {
      newErrors.username = { message: "usernameExceedsCharError" };
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = {
        message: t("usernameFormatError"),
      };
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = { message: t("passwordError") };
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = { message: t("passwordLengthError") };
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = { message: t("confirmPasswordError") };
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = { message: t("confirmPasswordMatchError") };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showError(t("validationError"));
      return;
    }

    const payload = { ...formData, gender };

    setLoading(true);
    try {
      const res = await sendOTPRegister(payload);
      showSuccess(t("sentOtpSuccess"));
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
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
  ];

  return (
    <ScreenContainer>
      <BackHeader title={t("register")} animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text variant="h2" weight="bold" className="mt-4 mb-6">
          {t("registerTitle")}
        </Text>

        <FormField
          name="fullname"
          label={t("fullname")}
          placeholder={t("enterFullname")}
          value={formData.fullname}
          onChange={handleChange}
          error={errors}
          required
        />

        <FormField
          name="email"
          label="Email"
          placeholder={t("enterEmail")}
          value={formData.email}
          onChange={handleChange}
          error={errors}
          inputType="email"
          required
        />

        <FormField
          name="phoneNumber"
          label={t("phoneNumber")}
          placeholder={t("enterPhoneNumber")}
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors}
          inputType="phone"
          required
        />

        <FormField
          name="username"
          label={t("username")}
          placeholder={t("enterUsername")}
          value={formData.username}
          onChange={handleChange}
          error={errors}
          required
        />

        <FormField
          name="password"
          label={t("password")}
          placeholder={t("enterPassword")}
          value={formData.password}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <FormField
          name="confirmPassword"
          label={t("confirmPassword")}
          placeholder={t("enterConfirmPassword")}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <CustomRadio
          label={t("chooseGender")}
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
          {t("register")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
