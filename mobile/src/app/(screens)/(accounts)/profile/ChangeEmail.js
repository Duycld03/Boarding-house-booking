import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/form/index";
import { changePassword, getUser } from "@/API/authAPI";
import { useNotification } from "@/context/NotificationProvider";
import { sendOTPChangeEmail } from "@/API/accountAPI";

function ChangeEmail() {
  const router = useRouter();
  const { t } = useTranslation("changeEmail");
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError(t("validationError"));
      return;
    }

    try {
      setLoading(true);
      const res = await sendOTPChangeEmail(formData);

      showSuccess(t("message.success"));
      router.replace({
        pathname: "/profile/verifyChangeEmail",
        params: {
          email: res?.email,
          token: res?.token,
        },
      });
    } catch (error) {
      showError(t("message.error"));
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      await getUser();
    } catch (error) {
      showError(error?.response?.data?.message || "Authentication error");
      router.replace("/"); // Navigate to home or login screen
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader
        title={t("changeEmailTitle")}
        onBackPress={() => router.back()}
      />

      <ScrollContainer keyboardAvoiding className="px-4">
        <FormField
          name="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          value={formData.email}
          onChange={handleChange}
          error={errors}
          inputType="email"
          required
        />

        <Button
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          {t("changeEmailButton")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default ChangeEmail;
