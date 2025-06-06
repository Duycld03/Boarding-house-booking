import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { Checkbox, FormField } from "@/components/form/index";
import { verifyChangeEmail } from "@/API/accountAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function VerifyChangeEmail() {
  const router = useRouter();
  const { t } = useTranslation("verifyChangeEmail");
  const { email, token } = useLocalSearchParams();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    otp: "",
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

    if (!formData.otp.trim()) {
      newErrors.otp = { message: t("otpError") };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleVerifyChangeEmail = async () => {
    if (!validateForm()) {
      showError(t("validationError"));
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      email,
      token,
    };

    try {
      const res = await verifyChangeEmail(payload);
      showSuccess(t("successMessage"));
      router.back();
      router.replace("/(screens)/(accounts)/profile");
      showError(t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader title={t("verifyChangeEmailTitle")} animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text variant="h2" weight="bold" className="mt-4 mb-6">
          {t("verifyChangeEmailTitle")}
        </Text>

        <FormField
          name="otp"
          label="OTP"
          placeholder={t("otpPlaceholder")}
          value={formData.otp}
          onChange={handleChange}
          error={errors}
          required
        />

        <Button
          onPress={handleVerifyChangeEmail}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          {t("verifyChangeEmailButton")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
