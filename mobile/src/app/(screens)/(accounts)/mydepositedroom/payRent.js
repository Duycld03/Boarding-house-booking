import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { ScrollContainer } from "@/components/layout";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/context/NotificationProvider";
import { payRent } from "@/API/depositAPI";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCurrentUser } from "@/context/userContext";

const PayRent = () => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation("payRent");
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { isLogin, user } = useCurrentUser();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [depositInfo, setDepositInfo] = useState(null);
  const [checking, setChecking] = useState(true);

  // Memoize formatDate and formatCurrency to prevent recreation on each render
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    // Check if the date is already in dd/mm/yyyy format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Otherwise parse and format the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }, []);

  // Parse deposit info only once
  useEffect(() => {
    if (!isLogin) {
      router.replace("/login");
      return;
    }

    // Only process deposit data if we haven't already
    if (checking && params.deposit) {
      try {
        const depositData = JSON.parse(params.deposit);
        setDepositInfo(depositData);
        setChecking(false);
      } catch (error) {
        console.error("Error parsing deposit data:", error);
        showError(t("invalidDepositData"));
        router.back();
        setChecking(false);
      }
    } else if (checking && !params.deposit) {
      showError(t("invalidDepositData"));
      router.back();
      setChecking(false);
    }
  }, [isLogin, params.deposit, router, showError, t, checking]);

  const handlePayment = useCallback(async () => {
    if (!paymentMethod) {
      showError(t("selectPaymentMethod"));
      return;
    }

    setLoading(true);
    try {
      // Send payment request to server
      const response = await payRent({
        userId: user?._id,
        depositRoomId: depositInfo?._id,
        paymentMethod: paymentMethod,
      });

      // Check if response contains a payment URL
      if (response.paymentUrl) {
        setLoading(false);
        showSuccess(t("redirectingToPayment"));

        // Open the payment URL in the device's browser
        Linking.openURL(response.paymentUrl);
      } else if (response.success) {
        setLoading(false);
        showSuccess(t("paymentInitiated"));
        router.back();
      } else {
        throw new Error(response.message || t("paymentFailed"));
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError(error.message || t("paymentFailed"));
      setLoading(false);
    }
  }, [paymentMethod, user, depositInfo, t, showError, showSuccess, router]);

  if (checking || !depositInfo) {
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
    <ScrollContainer withPadding={false}>
      <BackHeader
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
        onBackPress={() => router.back()}
        title={t("payRent")}
      />

      <View className="flex-1">
        {/* Deposit Summary Card */}
        <View className="px-4 py-4">
          <LinearGradient
            colors={
              isDarkMode ? ["#1f2937", "#111827"] : ["#ffffff", "#f9fafb"]
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
            }}
          >
            <View
              className={themedClasses(
                "bg-white rounded-2xl p-5",
                "bg-gray-800 rounded-2xl p-5"
              )}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100"
                  }`}
                >
                  <MaterialIcons
                    name="home-work"
                    size={22}
                    color={isDarkMode ? "#818cf8" : "#4f46e5"}
                  />
                </View>
                <View>
                  <Text
                    className={themedClasses(
                      "text-xl font-bold text-gray-900",
                      "text-xl font-bold text-gray-100"
                    )}
                  >
                    {depositInfo.name}
                  </Text>
                  <Text
                    className={themedClasses(
                      "text-base text-gray-700",
                      "text-base text-gray-300"
                    )}
                  >
                    {t("room")} {depositInfo.roomNumber}
                  </Text>
                </View>
              </View>

              <LinearGradient
                colors={
                  isDarkMode
                    ? [
                        "rgba(75, 85, 99, 0)",
                        "rgba(75, 85, 99, 0.5)",
                        "rgba(75, 85, 99, 0)",
                      ]
                    : [
                        "rgba(229, 231, 235, 0)",
                        "rgba(229, 231, 235, 0.8)",
                        "rgba(229, 231, 235, 0)",
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-[1px] mb-4"
              />

              <View className="space-y-3">
                {/* Rental Period */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View
                      className={`p-2 rounded-full mr-3 ${
                        isDarkMode ? "bg-green-900/30" : "bg-green-100"
                      }`}
                    >
                      <MaterialCommunityIcons
                        name="calendar-range"
                        size={16}
                        color={isDarkMode ? "#4ade80" : "#22c55e"}
                      />
                    </View>
                    <Text
                      className={themedClasses(
                        "text-gray-700",
                        "text-gray-300"
                      )}
                    >
                      {t("rentalPeriod")}
                    </Text>
                  </View>
                  <Text
                    className={themedClasses(
                      "font-semibold text-gray-800",
                      "font-semibold text-gray-100"
                    )}
                  >
                    {formatDate(depositInfo.startDate)} -{" "}
                    {formatDate(depositInfo.endDate)}
                  </Text>
                </View>

                {/* Amount */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View
                      className={`p-2 rounded-full mr-3 ${
                        isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                      }`}
                    >
                      <FontAwesome
                        name="money"
                        size={16}
                        color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                      />
                    </View>
                    <Text
                      className={themedClasses(
                        "text-gray-700",
                        "text-gray-300"
                      )}
                    >
                      {t("amountToPay")}
                    </Text>
                  </View>
                  <Text
                    className={themedClasses(
                      "font-bold text-xl text-gray-800",
                      "font-bold text-xl text-gray-100"
                    )}
                  >
                    {formatCurrency(depositInfo.amount)}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Payment Methods */}
        <View className="px-4 py-4">
          <Text
            className={themedClasses(
              "text-lg font-bold text-gray-800 mb-4",
              "text-lg font-bold text-gray-200 mb-4"
            )}
          >
            {t("selectPaymentMethod")}
          </Text>

          {/* VNPay Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod("vnpay")}
            className={`mb-3 rounded-xl border p-4 ${
              paymentMethod === "vnpay"
                ? isDarkMode
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-blue-500 bg-blue-50"
                : isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`rounded-full p-2 mr-3 ${
                    isDarkMode ? "bg-blue-900/40" : "bg-blue-100"
                  }`}
                >
                  <FontAwesome5
                    name="credit-card"
                    size={16}
                    color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                  />
                </View>
                <Text
                  className={themedClasses(
                    "font-bold text-gray-800",
                    "font-bold text-gray-100"
                  )}
                >
                  VNPay
                </Text>
              </View>
              {paymentMethod === "vnpay" && (
                <View
                  className={
                    isDarkMode
                      ? "bg-blue-800 p-1 rounded-full"
                      : "bg-blue-100 p-1 rounded-full"
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* MoMo Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod("momo")}
            className={`mb-3 rounded-xl border p-4 ${
              paymentMethod === "momo"
                ? isDarkMode
                  ? "border-pink-500 bg-pink-900/20"
                  : "border-pink-500 bg-pink-50"
                : isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`rounded-full p-2 mr-3 ${
                    isDarkMode ? "bg-pink-900/40" : "bg-pink-100"
                  }`}
                >
                  <FontAwesome5
                    name="wallet"
                    size={16}
                    color={isDarkMode ? "#f472b6" : "#ec4899"}
                  />
                </View>
                <Text
                  className={themedClasses(
                    "font-bold text-gray-800",
                    "font-bold text-gray-100"
                  )}
                >
                  MoMo
                </Text>
              </View>
              {paymentMethod === "momo" && (
                <View
                  className={
                    isDarkMode
                      ? "bg-pink-800 p-1 rounded-full"
                      : "bg-pink-100 p-1 rounded-full"
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isDarkMode ? "#f472b6" : "#ec4899"}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Button */}
      <View
        className={`p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"} border-t ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading || !paymentMethod}
          className={`rounded-xl py-4 ${
            !paymentMethod
              ? isDarkMode
                ? "bg-gray-700"
                : "bg-gray-300"
              : loading
              ? isDarkMode
                ? "bg-indigo-700"
                : "bg-indigo-400"
              : isDarkMode
              ? "bg-indigo-600"
              : "bg-indigo-600"
          }`}
        >
          <View className="flex-row justify-center items-center">
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
            ) : (
              <FontAwesome5
                name="credit-card"
                size={16}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text className="text-white font-bold text-lg">
              {loading ? t("processing") : t("confirmPayment")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollContainer>
  );
};

export default PayRent;
