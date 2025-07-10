// Tạo file: mobile/src/app/(screens)/(accounts)/mydepositedroom/refund.js
import React, { useState, useEffect } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { createRefundRequest } from "@/API/refundRequestAPI";
import { useCurrentUser } from "@/context/userContext";
import { LinearGradient } from "expo-linear-gradient";

const reasonOptionsKeys = [
  "emergencyMove",
  "roomCondition",
  "ownerIssue",
  "personalReason",
  "jobChange",
  "familyIssue",
  "healthIssue",
  "other",
];

export default function RefundRequest() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("refundRequest");
  const { showSuccess, showError } = useNotification();
  const { isLogin } = useCurrentUser();
  const { depositId } = useLocalSearchParams();

  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [loadingDepositInfo, setLoadingDepositInfo] = useState(false);

  // Check login status
  useEffect(() => {
    if (!isLogin) {
      router.replace("/login");
      return;
    }
  }, [isLogin, router]);

  // Validate depositId
  useEffect(() => {
    if (!depositId) {
      showError(t("invalidDepositId"));
      router.back();
    }
  }, [depositId, router, showError, t]);

  const validateForm = () => {
    if (!selectedReason.trim()) {
      showError(t("reasonRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await createRefundRequest({
        depositRoomId: depositId,
        reason: selectedReason,
      });

      if (response.success) {
        showSuccess(t("requestSubmitted"));
        router.back();
      } else {
        throw new Error(response.message || t("submitError"));
      }
    } catch (error) {
      console.error("Error submitting refund request:", error);
      showError(
        error.response?.data?.message ||
          error.message ||
          t("submitError")
      );
    } finally {
      setLoading(false);
    }
  };

  // Get reason options
  const getReasonOptions = () => {
    return reasonOptionsKeys.map((key) => ({
      value: t(`reasons.${key}`),
      label: t(`reasons.${key}`),
    }));
  };

  const reasonOptions = getReasonOptions();

  if (loadingDepositInfo) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#3b82f6" : "#2563eb"}
        />
      </View>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader
        title={t("title")}
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
      />

      <ScrollContainer keyboardAvoiding className="px-4">
        {/* Info Card */}
        <View className="mb-6">
          <LinearGradient
            colors={
              isDarkMode
                ? ["#1f2937", "#111827"]
                : ["#ffffff", "#f9fafb"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-0.5"
            style={{
              shadowColor: isDarkMode ? "#000" : "#5c93bb",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.3 : 0.15,
              shadowRadius: 12,
              elevation: 8,
              borderRadius: 16,
            }}
          >
            <View
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-2xl p-5`}
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isDarkMode
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <MaterialIcons
                    name="assignment-return"
                    size={24}
                    color={isDarkMode ? "#f87171" : "#ef4444"}
                  />
                </View>
                <View>
                  <Text
                    className={`text-xl font-bold ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {t("refundRequestTitle")}
                  </Text>
                  <Text
                    className={`text-base ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("refundRequestSubtitle")}
                  </Text>
                </View>
              </View>

              <View
                className={`p-4 rounded-xl ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } mb-2`}
                >
                  {t("importantNote")}
                </Text>
                <Text
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("refundPolicy")}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Reason Selection */}
        <View className="mb-6">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {t("reason")} <Text style={{ color: "red" }}>*</Text>
          </Text>

          <TouchableOpacity
            className={`border rounded-lg p-4 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-300 bg-white"
            }`}
            onPress={() => setShowReasonPicker(true)}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-base ${
                  isDarkMode ? "text-gray-200" : "text-black"
                } ${!selectedReason ? "opacity-60" : ""}`}
              >
                {selectedReason || t("selectReason")}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
            </View>
          </TouchableOpacity>

          {/* Reason Picker Modal */}
          <Modal
            visible={showReasonPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowReasonPicker(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50 justify-end"
              activeOpacity={1}
              onPress={() => setShowReasonPicker(false)}
            >
              <View
                className={`rounded-t-3xl max-h-[80%] ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <View
                  className={`flex-row justify-between items-center p-4 border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {t("selectReason")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowReasonPicker(false)}
                    className="p-1"
                  >
                    <AntDesign
                      name="close"
                      size={20}
                      color={isDarkMode ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView className="p-4">
                  {reasonOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 border-b ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      } ${
                        selectedReason === option.value
                          ? isDarkMode
                            ? "bg-gray-700"
                            : "bg-gray-100"
                          : ""
                      }`}
                      onPress={() => {
                        setSelectedReason(option.value);
                        setShowReasonPicker(false);
                      }}
                    >
                      <Text
                        className={`text-base ${
                          selectedReason === option.value
                            ? "font-semibold"
                            : ""
                        } ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !selectedReason}
          fullWidth
          className="mb-8"
          style={{
            backgroundColor: isDarkMode ? "#ef4444" : "#dc2626",
            borderRadius: 12,
            paddingVertical: 16,
            opacity: (!selectedReason || loading) ? 0.6 : 1,
          }}
        >
          {loading ? t("submitting") : t("submitRequest")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}