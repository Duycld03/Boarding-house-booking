import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  BackHandler,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui";
import Button from "@/components/ui/Button";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { ScrollContainer } from "@/components/layout";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/context/NotificationProvider";
import { payDeposit } from "@/API/depositAPI";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCurrentUser } from "@/context/userContext";
import WebView from "react-native-webview";
import formatAmount from "@/utils/formatAmount";

const PayDeposit = () => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, i18n } = useTranslation("payDeposit"); // Create a new translation namespace
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
        router.back();
        setChecking(false);
      }
    } else if (checking && !params.deposit) {
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
      showError(t("pleaseSelectPaymentMethod"));
      return;
    }

    setLoading(true);
    try {
      // Send payment request to server using payDeposit API
      const response = await payDeposit({
        depositRoomId: depositInfo?._id,
        paymentMethod: paymentMethod,
      });

      // Check if response contains a payment URL
      if (response.payUrl) {
        setLoading(false);
        // Show in WebView
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
      showError(
        error.response?.data?.message || error.message || t("paymentFailed")
      );
      setLoading(false);
    }
  }, [paymentMethod, depositInfo, t, showError, showSuccess, router]);

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
      <ScrollContainer withPadding={false}>
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
      </ScrollContainer>
    );
  }

  // Render payment method item with consistent border-radius and fixed color issues
  const PaymentMethodItem = ({
    method,
    title,
    icon,
    iconComponent,
    color,
    darkColor,
  }) => (
    <View
      className={`mb-3 rounded-xl overflow-hidden`}
      style={{
        borderRadius: 12,
        shadowColor: isDarkMode ? "#000" : "#5c93bb",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Button
        onPress={() => setPaymentMethod(method)}
        variant={paymentMethod === method ? "primary" : "outline"}
        fullWidth={true}
        size="md"
        style={{
          borderRadius: 12,
          paddingVertical: 18,
          backgroundColor:
            paymentMethod === method
              ? isDarkMode
                ? "#4f46e5"
                : "#4f46e5"
              : isDarkMode
              ? "#1f2937"
              : "#ffffff",
          borderColor:
            paymentMethod === method
              ? isDarkMode
                ? "#6366f1"
                : "#6366f1"
              : isDarkMode
              ? "#374151"
              : "#e5e7eb",
        }}
      >
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center">
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: isDarkMode
                  ? `${color === "blue" ? "#1e3a8a" : "#831843"}80`
                  : `${color === "blue" ? "#dbeafe" : "#fce7f3"}`,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {iconComponent || (
                <FontAwesome5
                  name={icon}
                  size={18}
                  color={
                    color === "blue"
                      ? isDarkMode
                        ? "#60a5fa"
                        : "#2563eb"
                      : isDarkMode
                      ? "#f472b6"
                      : "#db2777"
                  }
                />
              )}
            </View>
            <View>
              <Text
                className={
                  paymentMethod === method
                    ? "font-bold text-white text-base"
                    : themedClasses(
                        "font-bold text-gray-800 text-base",
                        "font-bold text-gray-100 text-base"
                      )
                }
              >
                {title}
              </Text>
            </View>
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
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <ScrollContainer
          withPadding={false}
          keyboardAvoiding={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        >
          <BackHeader
            backIcon={
              <FontAwesome5
                name="chevron-left"
                size={18}
                color={isDarkMode ? "#fff" : "#333"}
              />
            }
            onBackPress={() => router.back()}
            title={t("payDeposit")}
          />

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
                borderRadius: 16,
              }}
            >
              <View
                className={themedClasses(
                  "bg-white rounded-2xl p-5",
                  "bg-gray-800 rounded-2xl p-5"
                )}
                style={{ borderRadius: 16 }}
              >
                <View className="flex-row items-center mb-4">
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isDarkMode
                        ? "rgba(79, 70, 229, 0.2)"
                        : "rgba(79, 70, 229, 0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <MaterialIcons
                      name="home-work"
                      size={24}
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
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: isDarkMode
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(34, 197, 94, 0.1)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="calendar-range"
                          size={18}
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

                  {/* Rental Time */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: isDarkMode
                            ? "rgba(147, 51, 234, 0.2)"
                            : "rgba(147, 51, 234, 0.1)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <MaterialIcons
                          name="timer"
                          size={18}
                          color={isDarkMode ? "#c084fc" : "#9333ea"}
                        />
                      </View>
                      <Text
                        className={themedClasses(
                          "text-gray-700",
                          "text-gray-300"
                        )}
                      >
                        {t("rentalTime")}
                      </Text>
                    </View>
                    <Text
                      className={themedClasses(
                        "font-semibold text-gray-800",
                        "font-semibold text-gray-100"
                      )}
                    >
                      {depositInfo.rentalTime}{" "}
                      {depositInfo.rentalTime === 1 ? t("month") : t("months")}
                    </Text>
                  </View>

                  {/* Deposit Amount */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: isDarkMode
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(239, 68, 68, 0.1)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <FontAwesome
                          name="money"
                          size={16}
                          color={isDarkMode ? "#f87171" : "#ef4444"}
                        />
                      </View>
                      <Text
                        className={themedClasses(
                          "text-gray-700",
                          "text-gray-300"
                        )}
                      >
                        {t("depositAmount")}
                      </Text>
                    </View>
                    <Text
                      className={themedClasses(
                        "font-bold text-gray-800 text-lg",
                        "font-bold text-gray-100 text-lg"
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
            <PaymentMethodItem
              method="vnpay"
              title="VNPay"
              iconComponent={
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Entypo
                    name="credit-card"
                    size={20}
                    color={isDarkMode ? "#60a5fa" : "#2563eb"}
                  />
                </View>
              }
              color="blue"
              darkColor="#60a5fa"
            />

            {/* MoMo Option */}
            <PaymentMethodItem
              method="momo"
              title="MoMo"
              iconComponent={
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="wallet-outline"
                    size={20}
                    color={isDarkMode ? "#f472b6" : "#db2777"}
                  />
                </View>
              }
              color="pink"
              darkColor="#f472b6"
            />
          </View>

          {/* Payment Button - Update to add more bottom padding */}
          <View className="px-4 py-4 mb-16">
            <Button
              onPress={handlePayment}
              disabled={loading || !paymentMethod}
              loading={loading}
              variant="primary"
              fullWidth={true}
              size="lg"
              icon={
                loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <FontAwesome5 name="credit-card" size={16} color="#ffffff" />
                )
              }
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                backgroundColor: !paymentMethod
                  ? isDarkMode
                    ? "#374151"
                    : "#d1d5db"
                  : isDarkMode
                  ? "#4f46e5"
                  : "#4f46e5",
                opacity: !paymentMethod ? 0.8 : 1,
                shadowColor: isDarkMode ? "#000" : "#4f46e5",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.5 : 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              {loading
                ? t("processing")
                : !paymentMethod
                ? t("selectMethodFirst")
                : t("confirmPayment")}
            </Button>
          </View>
        </ScrollContainer>
      </ScrollView>
    </View>
  );
};

export default PayDeposit;
