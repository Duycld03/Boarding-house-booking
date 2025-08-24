import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { format, addMonths, addYears } from "date-fns";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { ScreenContainer, ScrollContainer } from "@/components/layout";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { useTheme } from "@/context/ThemeProvider";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { FormField } from "@/components/form";
import { createRenewalRequest } from "@/API/renewalRequestAPI";
import { useNotification } from "@/context/NotificationProvider";
import convertTimetap from "@/utils/convertTimetap";

export default function CreateRenewalRequest() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("myDepositedRoom");
  const { showSuccess, showError } = useNotification();
  const params = useLocalSearchParams();

  // Parse deposit data from params
  const depositData =
    typeof params.deposit === "string"
      ? JSON.parse(params.deposit)
      : params.deposit;

  // States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentEndDate, setCurrentEndDate] = useState(new Date());
  const [duration, setDuration] = useState(1);
  const [timeUnit, setTimeUnit] = useState("month");
  const [tenantNote, setTenantNote] = useState("");
  const [errors, setErrors] = useState({});

  // Extract data from deposit
  const roomId = depositData?.roomId;
  const roomNumber = depositData?.roomNumber;
  const boardingHouseName = depositData?.name;
  const depositId = depositData?._id;

  // Set initial end date from deposit data
  useEffect(() => {
    if (depositData?.endDate) {
      const endDate = new Date(depositData.endDate);
      setCurrentEndDate(endDate);
      setInitialLoading(false);
    }
  }, [depositData?.endDate]); // Chỉ depend vào endDate string, không phải object

  // Calculate requested end date using useMemo instead of useEffect
  const requestedEndDate = useMemo(() => {
    if (!currentEndDate) return new Date();

    let newEndDate;
    if (timeUnit === "month") {
      newEndDate = addMonths(currentEndDate, parseInt(duration));
    } else {
      newEndDate = addYears(currentEndDate, parseInt(duration));
    }

    return newEndDate;
  }, [duration, timeUnit, currentEndDate]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Check if requested end date is after current end date
    if (requestedEndDate <= currentEndDate) {
      newErrors.requestedEndDate = t("createRenewalRequest.endDateMustBeLater");
    }

    if (!duration || parseInt(duration) < 1) {
      newErrors.duration = t("createRenewalRequest.durationRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit renewal request
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const renewalData = {
        roomId,
        depositRoomId: depositId,
        currentEndDate: format(currentEndDate, "yyyy-MM-dd"),
        requestedEndDate: format(requestedEndDate, "yyyy-MM-dd"),
        tenantNote,
      };

      await createRenewalRequest(renewalData);
      showSuccess(t("createRenewalRequest.successMessage"));
      setTimeout(() => {
        router.push("/myrenewalrequest"); // Navigate to renewal requests list
      }, 2000);
    } catch (error) {
      console.error("Error creating renewal request:", error);
      showError(
        error?.response?.data?.message || t("createRenewalRequest.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle time unit
  const toggleTimeUnit = () => {
    const newTimeUnit = timeUnit === "month" ? "year" : "month";
    setTimeUnit(newTimeUnit);
  };

  // Show loading state while fetching initial data
  if (initialLoading) {
    return (
      <ScreenContainer withPadding={false}>
        <BackHeader
          title={t("createRenewalRequest.title")}
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? "#fff" : "#333"}
            />
          }
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff7a45" />
          <Text className="mt-4">{t("createRenewalRequest.loading")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader
        title={t("createRenewalRequest.title")}
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
        onBackPress={() => router.back()}
      />

      <ScrollView className="px-4">
        {/* Room Information */}
        <View className="mb-5">
          <Text
            className={`text-lg font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {t("createRenewalRequest.roomInformation")}
          </Text>

          <View
            className={`p-4 rounded-lg mb-4 ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {/* Boarding House Name */}
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons
                name="home-variant"
                size={20}
                color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                style={{ marginRight: 10 }}
              />
              <Text
                className={`font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {boardingHouseName}
              </Text>
            </View>

            {/* Room Number */}
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="door"
                size={20}
                color={isDarkMode ? "#4ade80" : "#22c55e"}
                style={{ marginRight: 10 }}
              />
              <Text
                className={`font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {t("createRenewalRequest.roomNumber")}: {roomNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Current End Date */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            {t("createRenewalRequest.currentEndDate")}
          </Text>
          <View
            className={`p-4 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text className={isDarkMode ? "text-white" : "text-black"}>
              {convertTimetap(currentEndDate)}
            </Text>
          </View>
        </View>

        {/* Duration Selection with FormField */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            {t("createRenewalRequest.renewalDuration")}{" "}
            <Text style={{ color: "red" }}>*</Text>
          </Text>

          <View className="flex-row space-x-2">
            {/* Duration Input Field */}
            <View className="flex-1">
              <FormField
                name="duration"
                placeholder={t("createRenewalRequest.enterDuration")}
                inputType="number"
                value={duration.toString()}
                onChange={(_, value) => {
                  const numValue = parseInt(value) || 1;
                  setDuration(numValue);
                  if (errors.duration) {
                    setErrors((prev) => ({ ...prev, duration: null }));
                  }
                }}
                error={errors}
              />
            </View>

            {/* Time Unit Toggle Button */}
            <View className="w-1/3">
              <TouchableOpacity
                onPress={toggleTimeUnit}
                className={`border rounded-lg p-2 ml-2 h-[42px] justify-center items-center ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-300 bg-white"
                }`}
              >
                <Text className={isDarkMode ? "text-white" : "text-black"}>
                  {timeUnit === "month"
                    ? t("createRenewalRequest.months")
                    : t("createRenewalRequest.years")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Requested End Date (Read-only) */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            {t("createRenewalRequest.requestedEndDate")}
          </Text>
          <View
            className={`p-4 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-300 bg-white"
            } ${errors.requestedEndDate ? "border-red-500" : ""}`}
          >
            <Text className={isDarkMode ? "text-white" : "text-black"}>
              {convertTimetap(requestedEndDate)}
            </Text>
          </View>
          {errors.requestedEndDate && (
            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
              {errors.requestedEndDate}
            </Text>
          )}
        </View>

        {/* Tenant Note - Manual TextInput implementation */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            {t("createRenewalRequest.tenantNote")}
          </Text>
          <TextInput
            placeholder={t("createRenewalRequest.enterNote")}
            value={tenantNote}
            onChangeText={setTenantNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className={`p-3 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
            style={{ minHeight: 100 }}
            placeholderTextColor={isDarkMode ? "#9ca3af" : "#9ca3af"}
          />
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          className="mt-6 mb-8"
        >
          {t("createRenewalRequest.submitRequest")}
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}
