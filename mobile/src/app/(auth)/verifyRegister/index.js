import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { Checkbox, FormField } from "@/components/form/index";
import { login, verifyRegister } from "@/API/authManagement";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const { account, token } = useLocalSearchParams();
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
      newErrors.otp = { message: "Vui lòng nhập OTP" };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleVerifyRegister = async () => {
    if (!validateForm()) {
      showError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      account: JSON.parse(account),
      token: token,
    };

    console.log(payload);

    try {
      console.log(payload);
      const res = await verifyRegister(payload);
      await AsyncStorage.setItem("access_token", res.token);
      showSuccess("Đăng ký thành công!");
      router.replace("/(tabs)/home");
    } catch (error) {
      showError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <BackHeader title="Verify Register" animationType="slide" />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text variant="h2" weight="bold" className="mt-4 mb-6">
          Nhập mã OTP
        </Text>

        <FormField
          name="otp"
          label="OTP"
          placeholder="Nhập mã OTP"
          value={formData.username}
          onChange={handleChange}
          error={errors}
          required
        />

        <Button
          onPress={handleVerifyRegister}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          Xác nhận
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
