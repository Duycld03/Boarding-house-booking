import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/form/index";
import { changePassword, getUser } from "@/API/authAPI";
import { useNotification } from "@/context/NotificationProvider";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";

function ChangePassword() {
  const router = useRouter();
  const { t } = useTranslation("changePassword");
  const { showSuccess, showError } = useNotification();
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
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

    if (!formData.oldPassword) {
      newErrors.oldPassword = {
        message: t("changePassword.oldPassword.required"),
      };
      isValid = false;
    } else if (formData.oldPassword.length < 5) {
      newErrors.oldPassword = {
        message: t("changePassword.oldPassword.minLength"),
      };
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = {
        message: t("changePassword.newPassword.required"),
      };
      isValid = false;
    } else if (formData.newPassword.length < 5) {
      newErrors.newPassword = {
        message: t("changePassword.newPassword.minLength"),
      };
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = {
        message: t("changePassword.confirmPassword.required"),
      };
      isValid = false;
    } else if (formData.confirmPassword.length < 5) {
      newErrors.confirmPassword = {
        message: t("changePassword.confirmPassword.minLength"),
      };
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = {
        message: t("changePassword.confirmPassword.notMatch"),
      };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(formData);

      showSuccess(t("changePassword.message.success"));
      router.back();
      router.replace("/profile"); // Navigate back to the profile page
    } catch (error) {
      showError(t("changePassword.message.error"));
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
        title={t("changePassword.title")}
        onBackPress={() => router.back()}
      />

      <ScrollContainer keyboardAvoiding className="px-4">
        <FormField
          name="oldPassword"
          label={t("changePassword.oldPassword.label")}
          placeholder={t("changePassword.oldPassword.placeholder")}
          value={formData.oldPassword}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <FormField
          name="newPassword"
          label={t("changePassword.newPassword.label")}
          placeholder={t("changePassword.newPassword.placeholder")}
          value={formData.newPassword}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <FormField
          name="confirmPassword"
          label={t("changePassword.confirmPassword.label")}
          placeholder={t("changePassword.confirmPassword.placeholder")}
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
          className="mt-6"
        >
          {t("changePassword.submitButton")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default ChangePassword;
