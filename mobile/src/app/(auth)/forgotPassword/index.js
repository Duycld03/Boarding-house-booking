import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/form";
import { useNotification } from "@/context/NotificationProvider";
import { forgotPassword } from "@/API/authAPI";

function ForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation("forgotPassword");
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({
    email: "",
  });
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
      const res = await forgotPassword(formData);

      showSuccess(t("message.success"));
    } catch (error) {
      showError(t("message.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader
        title={t("forgotPasswordTitle")}
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
          {t("sendResetLinkButton")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default ForgotPassword;
