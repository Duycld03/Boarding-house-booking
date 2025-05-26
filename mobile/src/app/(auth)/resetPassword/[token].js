import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { FormField } from "@/components/form/index";
import { resetPassword } from "@/API/authManagement";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { t } = useTranslation("resetPassword");
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
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

  const handleSubmit = async () => {
    console.log(token);
    if (!validateForm()) {
      showError(t("validationError"));
      return;
    }

    const payload = { password: formData.password, token };

    setLoading(true);
    try {
      await resetPassword(payload);
      showSuccess(t("successMessage"));
      router.push("/(auth)/login");
    } catch (error) {
      showError(error?.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader title={t("title")} animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text variant="h2" weight="bold" className="mt-4 mb-6">
          {t("header")}
        </Text>

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

        <Button
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          {t("submit")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
