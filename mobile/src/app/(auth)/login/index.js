import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { Checkbox, FormField } from "@/components/form/index";
import { login } from "@/API/authAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Link } from "@react-navigation/native";
import { Pressable } from "react-native";
import { useCurrentUser } from "@/context/userContext"; // Import UserContext

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation("login");
  const { showSuccess, showError } = useNotification();

  const { loginData } = useCurrentUser();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [remember, setRemember] = useState(false);
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

    if (!formData.username.trim()) {
      newErrors.username = { message: t("usernameError") };
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = { message: t("passwordError") };
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = { message: t("minLengthError") };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showError(t("validationError"));
      return;
    }

    setLoading(true);

    try {
      const res = await login(formData);

      if (!res.token || !res.user) {
        throw new Error("Invalid response from server");
      }

      // Use UserContext's loginData method
      await loginData(res.user, res.token);

      await AsyncStorage.setItem("access_token", res.token);
      showSuccess(t("success"));
      router.replace("/(tabs)/home");
    } catch (error) {
      showError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader title={t("login")} animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
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
        <Pressable
          onPress={() => router.push("/forgotPassword")}
          style={{ alignSelf: "flex-end", marginBottom: 12 }}
        >
          <Text variant="link" className="text-blue-600 text-sm">
            {t("forgotPassword")}
          </Text>
        </Pressable>

        <Checkbox
          checked={remember}
          onPress={() => {
            setRemember(!remember);
            setFormData((prev) => ({
              ...prev,
              remember: !remember,
            }));
          }}
          label={t("rememberMe")}
          className="mt-4 mb-6"
        />

        <Button
          onPress={handleLogin}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          {t("login")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
