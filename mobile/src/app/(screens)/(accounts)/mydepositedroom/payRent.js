import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  BackHandler,
  TouchableOpacity,
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
import { payRent } from "@/API/depositAPI";
import { getPaymentBillForRent } from "@/API/paymentBillAPI";
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
import { ScrollView } from "react-native";

const PayRent = () => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, i18n } = useTranslation("payRent");
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useNotification();
  const { isLogin, user } = useCurrentUser();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [depositInfo, setDepositInfo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [paymentBill, setPaymentBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [billError, setBillError] = useState(null);
  const [autoNavigateTimer, setAutoNavigateTimer] = useState(null);

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

  // Fetch payment bill data when deposit info is ready
  useEffect(() => {
    const fetchPaymentBill = async () => {
      if (depositInfo && !checking) {
        setLoadingBill(true);
        setBillError(null);
        try {
          const response = await getPaymentBillForRent(depositInfo._id);
          setPaymentBill(response.paymentBill);

          // If already paid, show message and auto navigate back
          if (response.isPaid) {
            showInfo(t("alreadyPaid"));
            const timer = setTimeout(() => {
              router.back();
            }, 2500);
            setAutoNavigateTimer(timer);
          }
        } catch (error) {
          setBillError(
            error.response?.data?.message || error.message || t("noBillFound")
          );
          showError(t("noBillFound"));

          // Auto navigate back after a delay when no bill is found
          const timer = setTimeout(() => {
            router.back();
          }, 3000);
          setAutoNavigateTimer(timer);
        } finally {
          setLoadingBill(false);
        }
      }
    };

    fetchPaymentBill();

    // Clear auto-navigate timer when component unmounts
    return () => {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }
    };
  }, [depositInfo, router]);

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

    if (!paymentBill) {
      showError(t("noBillFound"));
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
      showError(
        error.response?.data?.message || error.message || t("paymentFailed")
      );
      setLoading(false);
    }
  }, [
    paymentMethod,
    user,
    depositInfo,
    t,
    showError,
    showSuccess,
    router,
    paymentBill,
  ]);

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
        disabled={!paymentBill || loadingBill}
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
          opacity: !paymentBill || loadingBill ? 0.6 : 1,
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
              <Text
                className={
                  paymentMethod === method
                    ? "text-white text-xs opacity-80"
                    : themedClasses(
                        "text-gray-500 text-xs",
                        "text-gray-400 text-xs"
                      )
                }
              >
                {method === "vnpay" ? t("creditDebitCard") : t("eWallet")}
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

  // Render a bill item with icon
  const BillItem = ({
    title,
    subtitle,
    amount,
    icon,
    iconColor,
    iconBgColor,
  }) => (
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: iconBgColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {icon}
        </View>
        <View>
          <Text className={themedClasses("text-gray-700", "text-gray-300")}>
            {title}
          </Text>
          {subtitle && (
            <Text
              className={themedClasses(
                "text-xs text-gray-500",
                "text-xs text-gray-400"
              )}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Text
        className={themedClasses(
          "font-semibold text-gray-800",
          "font-semibold text-gray-100"
        )}
      >
        {amount}
      </Text>
    </View>
  );

  return (
    <ScrollView className="flex-1">
      <ScrollContainer
        withPadding={false}
        keyboardAvoiding={false}
        contentContainerStyle={{ paddingBottom: 24 }}
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
          title={t("payRent")}
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

                {/* Current Month/Period */}
                {paymentBill && (
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
                          name="event-note"
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
                        {t("billingPeriod")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          backgroundColor: isDarkMode
                            ? "rgba(147, 51, 234, 0.2)"
                            : "rgba(147, 51, 234, 0.1)",
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          className={themedClasses(
                            "font-semibold text-purple-700",
                            "font-semibold text-purple-300"
                          )}
                        >
                          {t("month")} {paymentBill.month}/{paymentBill.year}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Payment Bill Details */}
        {loadingBill ? (
          <View className="px-4 py-8 flex-row justify-center">
            <View className="items-center">
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#3b82f6" : "#2563eb"}
              />
              <Text
                className={themedClasses(
                  "text-gray-500 mt-4",
                  "text-gray-400 mt-4"
                )}
              >
                {t("loadingBill")}
              </Text>
            </View>
          </View>
        ) : billError ? (
          <View className="px-4 py-8">
            <View
              className={`p-5 rounded-lg ${
                isDarkMode ? "bg-red-900/30" : "bg-red-50"
              } border ${isDarkMode ? "border-red-800" : "border-red-200"}`}
              style={{
                shadowColor: isDarkMode ? "#000" : "#f87171",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View className="items-center mb-3">
                <MaterialIcons
                  name="error-outline"
                  size={48}
                  color={isDarkMode ? "#f87171" : "#ef4444"}
                />
              </View>
              <Text
                className={themedClasses(
                  "text-center font-medium text-red-700 text-lg",
                  "text-center font-medium text-red-300 text-lg"
                )}
              >
                {billError}
              </Text>
              <Text
                className={themedClasses(
                  "text-center text-red-600 mt-2",
                  "text-center text-red-400 mt-2"
                )}
              >
                {t("contactLandlord")}
              </Text>
              <Text
                className={themedClasses(
                  "text-center text-gray-500 mt-4 text-sm",
                  "text-center text-gray-400 mt-4 text-sm"
                )}
              >
                {t("redirecting")}...
              </Text>
            </View>
          </View>
        ) : paymentBill ? (
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={themedClasses(
                  "text-lg font-bold text-gray-800",
                  "text-lg font-bold text-gray-200"
                )}
              >
                {t("billDetails")}
              </Text>

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(59, 130, 246, 0.1)",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Feather
                  name="file-text"
                  size={14}
                  color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className={themedClasses(
                    "font-medium text-blue-700 text-sm",
                    "font-medium text-blue-300 text-sm"
                  )}
                >
                  {t("invoice")} #{paymentBill._id.substring(18)}
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={
                isDarkMode ? ["#1f2937", "#111827"] : ["#ffffff", "#f9fafb"]
              }
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
                {/* Room Rent */}
                <BillItem
                  title={t("roomRent")}
                  amount={formatCurrency(depositInfo.amount)}
                  icon={
                    <FontAwesome5
                      name="home"
                      size={16}
                      color={isDarkMode ? "#f87171" : "#ef4444"}
                    />
                  }
                  iconBgColor={
                    isDarkMode
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.1)"
                  }
                />

                {/* Electricity */}
                {paymentBill.electricalBill && (
                  <BillItem
                    title={t("electricity")}
                    subtitle={`${paymentBill.electricalBill.quantityConsumed} kWh`}
                    amount={formatCurrency(
                      paymentBill.electricalBill.totalAmount
                    )}
                    icon={
                      <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={18}
                        color={isDarkMode ? "#facc15" : "#eab308"}
                      />
                    }
                    iconBgColor={
                      isDarkMode
                        ? "rgba(234, 179, 8, 0.2)"
                        : "rgba(234, 179, 8, 0.1)"
                    }
                  />
                )}

                {/* Water */}
                {paymentBill.waterBill && (
                  <BillItem
                    title={t("water")}
                    subtitle={`${paymentBill.waterBill.quantityConsumed} m³`}
                    amount={formatCurrency(paymentBill.waterBill.totalAmount)}
                    icon={
                      <Ionicons
                        name="water"
                        size={18}
                        color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                      />
                    }
                    iconBgColor={
                      isDarkMode
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(59, 130, 246, 0.1)"
                    }
                  />
                )}

                {/* Additional Fees */}
                {paymentBill.additionalFee &&
                  paymentBill.additionalFee.length > 0 && (
                    <>
                      {paymentBill.additionalFee.map((fee, index) => (
                        <BillItem
                          key={index}
                          title={fee.feeName}
                          amount={formatCurrency(fee.feeAmount)}
                          icon={
                            <Feather
                              name="plus-circle"
                              size={16}
                              color={isDarkMode ? "#818cf8" : "#4f46e5"}
                            />
                          }
                          iconBgColor={
                            isDarkMode
                              ? "rgba(79, 70, 229, 0.2)"
                              : "rgba(79, 70, 229, 0.1)"
                          }
                        />
                      ))}
                    </>
                  )}

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
                  className="h-[1px] my-3"
                />

                {/* Total */}
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
                      <MaterialIcons
                        name="payments"
                        size={18}
                        color={isDarkMode ? "#4ade80" : "#22c55e"}
                      />
                    </View>
                    <Text
                      className={themedClasses(
                        "font-bold text-gray-800 text-base",
                        "font-bold text-gray-100 text-base"
                      )}
                    >
                      {t("total")}
                    </Text>
                  </View>
                  <Text
                    className={themedClasses(
                      "font-bold text-xl text-gray-800",
                      "font-bold text-xl text-gray-100"
                    )}
                  >
                    {formatCurrency(paymentBill.paymentAmount)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ) : null}

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

          {/* Warning message - keep as is */}
          {!paymentBill && !loadingBill && (
            <View
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-yellow-900/30" : "bg-yellow-50"
              } border ${
                isDarkMode ? "border-yellow-800" : "border-yellow-200"
              } mt-2`}
            >
              <View className="flex-row items-center justify-center mb-2">
                <MaterialIcons
                  name="warning-amber"
                  size={24}
                  color={isDarkMode ? "#fcd34d" : "#f59e0b"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={themedClasses(
                    "text-center font-medium text-yellow-700",
                    "text-center font-medium text-yellow-300"
                  )}
                >
                  {t("paymentDisabled")}
                </Text>
              </View>
              <Text
                className={themedClasses(
                  "text-center text-yellow-600 text-sm",
                  "text-center text-yellow-400 text-sm"
                )}
              >
                {t("contactLandlordForBill")}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Button - keep as part of scrollable content */}
        <View className="px-4 py-4 mb-8">
          <Button
            onPress={handlePayment}
            disabled={loading || !paymentMethod || !paymentBill || loadingBill}
            loading={loading}
            variant="primary"
            fullWidth={true}
            size="lg"
            icon={
              !paymentBill ? (
                <MaterialIcons
                  name="block"
                  size={20}
                  color={isDarkMode ? "#9ca3af" : "#6b7280"}
                />
              ) : loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <FontAwesome5 name="credit-card" size={16} color="#ffffff" />
              )
            }
            style={{
              borderRadius: 12,
              paddingVertical: 14,
              backgroundColor:
                !paymentMethod || !paymentBill || loadingBill
                  ? isDarkMode
                    ? "#374151"
                    : "#d1d5db"
                  : isDarkMode
                  ? "#4f46e5"
                  : "#4f46e5",
              opacity: !paymentMethod || !paymentBill || loadingBill ? 0.8 : 1,
              shadowColor: isDarkMode ? "#000" : "#4f46e5",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.5 : 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {loading
              ? t("processing")
              : !paymentBill
              ? t("cannotPay")
              : !paymentMethod
              ? t("selectMethodFirst")
              : t("confirmPayment")}
          </Button>
        </View>
      </ScrollContainer>
    </ScrollView>
  );
};

export default PayRent;
