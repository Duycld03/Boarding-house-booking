import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui";
import Button from "@/components/ui/Button"; // Import the Button component
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
import WebView from "react-native-webview";
import formatAmount from "@/utils/formatAmount"; // Import formatAmount utility

const PayRent = () => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, i18n } = useTranslation("payRent");
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { isLogin, user } = useCurrentUser();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [depositInfo, setDepositInfo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [webviewVisible, setWebviewVisible] = useState(false);

  // Get current language for formatAmount
  const currentLanguage = i18n.language || "vi";

  // Use formatAmount from utility
  const formatCurrency = useCallback(
    (value) => {
      return formatAmount(value, currentLanguage, {
        showCurrency: true,
        showFullFormat: true,
      });
    },
    [currentLanguage]
  );

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

  // Handle hardware back button when WebView is open
  useEffect(() => {
    const backAction = () => {
      if (webviewVisible) {
        setWebviewVisible(false);
        setPaymentUrl(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [webviewVisible]);

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
      if (response.payUrl) {
        setLoading(false);
        // Instead of opening in browser, show in WebView
        setPaymentUrl(response.payUrl);
        setWebviewVisible(true);
      } else if (response.success) {
        setLoading(false);
        showSuccess(t("paymentInitiated"));
        router.back();
      } else {
        throw new Error(response.message || t("paymentFailed"));
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError(
        error.response?.data?.message || error.message || t("paymentFailed")
      );
      setLoading(false);
    }
  }, [paymentMethod, user, depositInfo, t, showError, showSuccess, router]);

  // Handle WebView navigation state changes to detect payment completion
  const handleNavigationStateChange = (navState) => {
    // Look for URL patterns that match your vnpay-return or momo-return endpoints
    if (navState.url.includes("status=success")) {
      setWebviewVisible(false);
      setPaymentUrl(null);
      showSuccess(t("paymentSuccessful"));
      router.back();
    }
    // Check for failure indicators
    else if (navState.url.includes("status=fail")) {
      setWebviewVisible(false);
      setPaymentUrl(null);
      showError(t("paymentFailed"));
    }
  };

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

  // Show WebView when payment URL is available
  if (webviewVisible && paymentUrl) {
    return (
      <View className="flex-1">
        <BackHeader
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? "#fff" : "#333"}
            />
          }
          onBackPress={() => {
            setWebviewVisible(false);
            setPaymentUrl(null);
          }}
          title={paymentMethod === "vnpay" ? "VNPay" : "MoMo"}
        />
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 flex justify-center items-center bg-gray-100">
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#3b82f6" : "#2563eb"}
              />
            </View>
          )}
        />
      </View>
    );
  }

  // Render payment method item with consistent border-radius and fixed color issues
  const PaymentMethodItem = ({ method, title, icon, color, darkColor }) => (
    <View
      className={`mb-3 rounded-xl overflow-hidden`}
      style={{ borderRadius: 12 }} // Explicitly set borderRadius for consistent corners
    >
      <Button
        onPress={() => setPaymentMethod(method)}
        variant={paymentMethod === method ? "primary" : "outline"}
        fullWidth={true}
        size="md"
        style={{
          borderRadius: 12,
          paddingVertical: 16, // More vertical padding than the default
          backgroundColor:
            paymentMethod === method
              ? isDarkMode
                ? "#4f46e5" // Indigo-700 for dark mode selection
                : "#4f46e5" // Indigo-600 for light mode selection
              : isDarkMode
              ? "#1f2937" // Dark gray for dark mode unselected
              : "#ffffff", // White for light mode unselected
          borderColor:
            paymentMethod === method
              ? isDarkMode
                ? "#6366f1" // Indigo-500 for dark mode selection border
                : "#6366f1" // Indigo-500 for light mode selection border
              : isDarkMode
              ? "#374151" // Gray-700 for dark mode unselected border
              : "#e5e7eb", // Gray-200 for light mode unselected border
        }}
      >
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center">
            <View
              className={`rounded-full p-2 mr-3`}
              style={{
                borderRadius: 9999, // Explicitly set borderRadius for rounded-full
                backgroundColor: isDarkMode
                  ? `${color === "blue" ? "#1e3a8a" : "#831843"}80` // Darker colors with opacity for dark mode
                  : `${color === "blue" ? "#dbeafe" : "#fce7f3"}`, // Light colors for light mode
              }}
            >
              <FontAwesome5
                name={icon}
                size={16}
                color={
                  color === "blue"
                    ? isDarkMode
                      ? "#60a5fa"
                      : "#2563eb" // Blue colors
                    : isDarkMode
                    ? "#f472b6"
                    : "#db2777" // Pink colors
                }
              />
            </View>
            <Text
              className={
                paymentMethod === method
                  ? "font-bold text-white"
                  : themedClasses(
                      "font-bold text-gray-800",
                      "font-bold text-gray-100"
                    )
              }
            >
              {title}
            </Text>
          </View>
          {paymentMethod === method && (
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: 4,
                borderRadius: 9999,
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            </View>
          )}
        </View>
      </Button>
    </View>
  );

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
              borderRadius: 16, // Explicitly set borderRadius to match rounded-2xl
            }}
          >
            <View
              className={themedClasses(
                "bg-white rounded-2xl p-5",
                "bg-gray-800 rounded-2xl p-5"
              )}
              style={{ borderRadius: 16 }} // Explicitly set borderRadius for consistent corners
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100"
                  }`}
                  style={{ borderRadius: 9999 }} // Explicitly set borderRadius for rounded-full
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
                      style={{ borderRadius: 9999 }} // Explicitly set borderRadius for rounded-full
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

                {/* Amount - Now using formatAmount */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View
                      className={`p-2 rounded-full mr-3 ${
                        isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                      }`}
                      style={{ borderRadius: 9999 }} // Explicitly set borderRadius for rounded-full
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

          {/* VNPay Option - Using Button component */}
          <PaymentMethodItem
            method="vnpay"
            title="VNPay"
            icon="credit-card"
            color="blue"
            darkColor="#60a5fa"
          />

          {/* MoMo Option - Using Button component */}
          <PaymentMethodItem
            method="momo"
            title="MoMo"
            icon="wallet"
            color="pink"
            darkColor="#f472b6"
          />
        </View>
      </View>

      {/* Payment Button - Using Button component */}
      <View
        className={`p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"} border-t ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <Button
          onPress={handlePayment}
          disabled={loading || !paymentMethod}
          loading={loading}
          variant="primary"
          fullWidth={true}
          size="lg"
          icon={<FontAwesome5 name="credit-card" size={16} color="#ffffff" />}
          style={{ borderRadius: 12 }}
          className={
            !paymentMethod
              ? isDarkMode
                ? "bg-gray-700"
                : "bg-gray-300"
              : isDarkMode
              ? "bg-indigo-600"
              : "bg-indigo-600"
          }
        >
          {loading ? t("processing") : t("confirmPayment")}
        </Button>
      </View>
    </ScrollContainer>
  );
};

export default PayRent;
