import React, { useState } from "react";
import { View, Animated, TouchableOpacity } from "react-native";
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

const DepositCard = ({
  item,
  onRefund,
  onPayDeposit,
  onCreateRenewDeposit, // Thêm prop này
  index,
  isCreateRenewDeposit, // Thêm prop này
  hasExistingRefundRequest = false,
  refundRequestInfo = null,
  onPress,
}) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, i18n } = useTranslation("myDepositedRoom");
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    });
  };

  // Updated shouldShowRefund function - only based on rentalTime
  const shouldShowRefund = (rentalTime) => {
    // Convert rentalTime to number if it's a string
    const rentalTimeNum =
      typeof rentalTime === "string" ? parseInt(rentalTime) : rentalTime;

    // Show refund button if rental time is >= 2 months
    return rentalTimeNum >= 2;
  };

  // Updated renderActionButtons function
  const renderActionButtons = () => {
    if (item.status === "confirmed") {
      return (
        <>
          <View className="flex-row justify-between mt-2">
            {/* Request Refund Button - Show based on rental time */}
            {shouldShowRefund(item.rentalTime) && (
              <View className="flex-1 ml-2">
                <Button
                  onPress={() => onRefund(item)}
                  variant="secondary"
                  fullWidth={true}
                  size="md"
                  disabled={hasExistingRefundRequest} // Disable if request exists
                  icon={
                    hasExistingRefundRequest ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={isDarkMode ? "#6b7280" : "#9ca3af"}
                      />
                    ) : (
                      <Ionicons name="refresh" size={16} color="#fff" />
                    )
                  }
                  style={{
                    borderRadius: 12,
                    backgroundColor: hasExistingRefundRequest
                      ? isDarkMode
                        ? "#374151"
                        : "#e5e7eb"
                      : isDarkMode
                      ? "#b91c1c"
                      : "#dc2626",
                    opacity: hasExistingRefundRequest ? 0.6 : 1,
                  }}
                >
                  {hasExistingRefundRequest
                    ? t("refundRequested")
                    : t("requestRefund")}
                </Button>

                {/* Show refund request status if exists */}
                {hasExistingRefundRequest && refundRequestInfo && (
                  <View className="mt-2">
                    <Text
                      className={themedClasses(
                        "text-xs text-gray-600 text-center",
                        "text-xs text-gray-400 text-center"
                      )}
                    >
                      {t("refundStatus")}:{" "}
                      {t(`refundStatus.${refundRequestInfo.status}`)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </>
      );
    } else if (item.status === "accepted") {
      return (
        <View className="mt-2">
          <View className="flex-row justify-between gap-2">
            {/* Pay Deposit Button */}
            <View className="flex-1">
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

            {/* Create Renew Deposit Button */}
            {!isCreateRenewDeposit && (
              <View className="flex-1">
                <Button
                  onPress={() => onCreateRenewDeposit(item)}
                  variant="secondary"
                  fullWidth={true}
                  size="md"
                  icon={
                    <MaterialCommunityIcons
                      name="calendar-refresh"
                      size={16}
                      color="#fff"
                    />
                  }
                  style={{
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? "#047857" : "#059669", // Green color for renewal
                  }}
                >
                  {t("renewDeposit")}
                </Button>
              </View>
            )}
          </View>
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
      <TouchableOpacity onPress={() => onPress?.(item)} activeOpacity={0.8}>
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
                  {item.rentalTime} {t("months")}
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
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DepositCard;