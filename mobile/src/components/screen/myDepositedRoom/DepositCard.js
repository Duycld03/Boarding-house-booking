import React, { useState } from "react";
import { View, Animated } from "react-native";
import { Text } from "@/components/ui";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";
import { useTranslation } from "react-i18next";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import formatAmount from "@/utils/formatAmount";
import { checkPayRentStatus } from "@/API/depositAPI";
import { getPaymentBillForRent } from "@/API/paymentBillAPI";
import { useFocusEffect } from "expo-router";

const DepositCard = ({ item, onPayRent, onRefund, onPayDeposit, index }) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, i18n } = useTranslation("myDepositedRoom"); // Get i18n to access current language
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Create unique state keys for each card based on item ID
  const [paymentStatusMap, setPaymentStatusMap] = useState({});
  const [checkingPaymentMap, setCheckingPaymentMap] = useState({});
  // New state to track if a payment bill exists for the month
  const [paymentBillExistsMap, setPaymentBillExistsMap] = useState({});

  // Define getters for this specific card
  const isRentPaid = paymentStatusMap[item._id] || false;
  const checkingPayment = checkingPaymentMap[item._id] || false;
  const paymentBillExists = paymentBillExistsMap[item._id] || false;

  // Replace useEffect with useFocusEffect for checking payment status
  useFocusEffect(
    React.useCallback(() => {
      const checkPaymentStatus = async () => {
        if (item.status === "confirmed") {
          // Update checking state
          setCheckingPaymentMap((prev) => ({
            ...prev,
            [item._id]: true,
          }));

          try {
            // First, check if there's a payment bill for the current month
            const paymentBillResponse = await getPaymentBillForRent(item._id);

            // Safe check for response data structure
            const hasBill = !!paymentBillResponse;

            // Set whether a bill exists for this month
            setPaymentBillExistsMap((prev) => ({
              ...prev,
              [item._id]: hasBill,
            }));

            // Then check if it's paid
            const response = await checkPayRentStatus(item._id);

            // Update paid state
            setPaymentStatusMap((prev) => ({
              ...prev,
              [item._id]: response.isPaid,
            }));
          } catch (error) {
            // If error is 404 (no payment bill found), set paymentBillExists to false
            if (error.response && error.response.status === 404) {
              setPaymentBillExistsMap((prev) => ({
                ...prev,
                [item._id]: false,
              }));
            }
          } finally {
            // Reset checking state
            setCheckingPaymentMap((prev) => ({
              ...prev,
              [item._id]: false,
            }));
          }
        }
      };

      checkPaymentStatus();

      // Clean up function
      return () => {
        // Any cleanup code if needed
      };
    }, [item._id, item.status])
  );

  // Animation effect
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, index]);

  // Get current language from i18n
  const currentLanguage = i18n.language || "vi";

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return isDarkMode ? "#22c55e" : "#16a34a"; // Green
      case "pending":
        return isDarkMode ? "#f59e0b" : "#d97706"; // Amber
      case "rejected":
        return isDarkMode ? "#ef4444" : "#dc2626"; // Red
      case "cancelled":
        return isDarkMode ? "#6b7280" : "#4b5563"; // Gray
      default:
        return isDarkMode ? "#3b82f6" : "#2563eb"; // Blue
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <MaterialIcons
            name="verified"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "pending":
        return (
          <MaterialCommunityIcons
            name="progress-clock"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "rejected":
        return (
          <MaterialIcons
            name="cancel"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "cancelled":
        return (
          <MaterialIcons
            name="do-not-disturb"
            size={14}
            color={getStatusColor(status)}
          />
        );
      default:
        return (
          <AntDesign name="question" size={14} color={getStatusColor(status)} />
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Use formatAmount utility with appropriate options
  const formatCurrency = (value) => {
    return formatAmount(value, currentLanguage, {
      showCurrency: true,
      showFullFormat: true,
    });
  };

  const shouldShowRefund = (endDateStr) => {
    if (!endDateStr) return false;

    let endDate;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(endDateStr)) {
      const [day, month, year] = endDateStr.split("/").map(Number);
      endDate = new Date(year, month - 1, day);
    } else {
      endDate = new Date(endDateStr);
    }

    if (isNaN(endDate.getTime())) return false;

    const currentDate = new Date();
    const twoMonthsBeforeEnd = new Date(endDate);
    twoMonthsBeforeEnd.setMonth(twoMonthsBeforeEnd.getMonth() - 2);

    return currentDate <= twoMonthsBeforeEnd;
  };

  // Update the renderPayRentButton function to correctly show payment button

  const renderPayRentButton = () => {
    if (checkingPayment) {
      return (
        <Button
          disabled={true}
          variant="outline"
          fullWidth={true}
          size="md"
          style={{
            borderRadius: 12,
            backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          }}
        >
          <View className="flex-row items-center justify-center">
            <MaterialCommunityIcons
              name="loading"
              size={16}
              color={isDarkMode ? "#60a5fa" : "#3b82f6"}
              className="animate-spin mr-2"
            />
            <Text className={themedClasses("text-gray-700", "text-gray-300")}>
              {t("checking")}...
            </Text>
          </View>
        </Button>
      );
    }

    // Show "Rent Paid" button if already paid
    if (isRentPaid) {
      return (
        <Button
          disabled={true}
          variant="success"
          fullWidth={true}
          size="md"
          icon={<MaterialIcons name="check-circle" size={16} color="#fff" />}
          style={{
            borderRadius: 12,
            backgroundColor: isDarkMode ? "#15803d" : "#16a34a",
          }}
        >
          {t("rentPaid")}
        </Button>
      );
    }

    // Show "Pay Rent" button if there's a bill and it hasn't been paid
    if (paymentBillExists) {
      return (
        <Button
          onPress={() => onPayRent(item)}
          variant="primary"
          fullWidth={true}
          size="md"
          icon={<FontAwesome name="dollar" size={14} color="#fff" />}
          style={{
            borderRadius: 12,
            backgroundColor: isDarkMode ? "#1d4ed8" : "#2563eb",
          }}
        >
          {t("payRent")}
        </Button>
      );
    }

    // Default: No bill for the month
    return (
      <Button
        disabled={true}
        variant="outline"
        fullWidth={true}
        size="md"
        style={{
          borderRadius: 12,
          backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          opacity: 0.7,
        }}
      >
        <Text className={themedClasses("text-gray-500", "text-gray-400")}>
          {t("noBillThisMonth")}
        </Text>
      </Button>
    );
  };

  // Add this function to your DepositCard component
  const renderActionButtons = () => {
    if (item.status === "confirmed") {
      return (
        <>
          <View className="flex-row justify-between mt-2">
            {/* Pay Rent Button */}
            <View
              className={
                shouldShowRefund(item.endDate) ? "flex-1 mr-2" : "flex-1"
              }
            >
              {renderPayRentButton()}
            </View>

            {/* Request Refund Button - Show if refund is available */}
            {shouldShowRefund(item.endDate) && (
              <View className="flex-1 ml-2">
                <Button
                  onPress={() => onRefund(item)}
                  variant="secondary"
                  fullWidth={true}
                  size="md"
                  icon={<Ionicons name="refresh" size={16} color="#fff" />}
                  style={{
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? "#b91c1c" : "#dc2626",
                  }}
                >
                  {t("requestRefund")}
                </Button>
              </View>
            )}
          </View>
        </>
      );
    } else if (item.status === "accepted") {
      return (
        <View className="mt-2">
          <Button
            onPress={() => onPayDeposit(item)}
            variant="primary"
            fullWidth={true}
            size="md"
            icon={<FontAwesome name="dollar" size={14} color="#fff" />}
            style={{
              borderRadius: 12,
              backgroundColor: isDarkMode ? "#1d4ed8" : "#2563eb",
            }}
          >
            {t("payDeposit")}
          </Button>
        </View>
      );
    }

    return null;
  };

  // Card rendering with Button component
  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginHorizontal: 16,
        marginVertical: 8,
      }}
    >
      <LinearGradient
        colors={isDarkMode ? ["#1f2937", "#111827"] : ["#ffffff", "#f9fafb"]}
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
          {/* Status Badge - Top Right */}
          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: `${getStatusColor(item.status)}15`,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${getStatusColor(item.status)}30`,
              flexDirection: "row",
              alignItems: "center",
              zIndex: 10,
              overflow: "hidden",
            }}
          >
            {getStatusIcon(item.status)}
            <Text
              style={{
                color: getStatusColor(item.status),
                fontWeight: "600",
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              {t(`status.${item.status}`)}
            </Text>
          </View>

          {/* Property & Room Info */}
          <View className="mb-4 pr-28">
            <View className="flex-row items-center mb-1">
              <MaterialIcons
                name="home-work"
                size={18}
                color={isDarkMode ? "#9ca3af" : "#4b5563"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={themedClasses(
                  "text-lg font-bold text-gray-900",
                  "text-lg font-bold text-gray-100"
                )}
              >
                {item.name}
              </Text>
            </View>

            <View className="flex-row items-center">
              <FontAwesome5
                name="door-open"
                size={14}
                color={isDarkMode ? "#9ca3af" : "#4b5563"}
                style={{ marginRight: 8, marginLeft: 2 }}
              />
              <Text
                className={themedClasses(
                  "text-base font-medium text-gray-700",
                  "text-base font-medium text-gray-300"
                )}
              >
                {t("room")} {item.roomNumber}
              </Text>
            </View>
          </View>

          {/* Divider with gradient */}
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

          {/* Deposit Details */}
          <View className="space-y-3 mb-4">
            {/* Amount - Now using formatAmount */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                  style={{ borderRadius: 9999 }}
                >
                  <FontAwesome
                    name="money"
                    size={14}
                    color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
                >
                  {t("depositAmount")}
                </Text>
              </View>
              <Text
                className={themedClasses(
                  "font-bold text-gray-800",
                  "font-bold text-gray-100"
                )}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>

            {/* Rental Period */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}
                  style={{ borderRadius: 9999 }}
                >
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={14}
                    color={isDarkMode ? "#4ade80" : "#22c55e"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
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
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>

            {/* Rental Time */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                  }`}
                  style={{ borderRadius: 9999 }}
                >
                  <MaterialIcons
                    name="timer"
                    size={14}
                    color={isDarkMode ? "#c084fc" : "#a855f7"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
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
                {item.rentalTime}{" "}
              </Text>
            </View>
          </View>

          {/* Actions Buttons */}
          {(item.status === "confirmed" || item.status === "accepted") && (
            <>
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
              {renderActionButtons()}
            </>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default DepositCard;
