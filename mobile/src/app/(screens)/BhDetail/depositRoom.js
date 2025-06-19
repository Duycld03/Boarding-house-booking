import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { useTheme } from "@/context/ThemeProvider";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FormField } from "@/components/form";
import DateTimePicker from "@react-native-community/datetimepicker";
import formatAmount from "@/utils/formatAmount";
import { depositRoom } from "@/API/depositAPI";

import { useNotification } from "@/context/NotificationProvider";

export default function DepositRoom() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("depositPopup");
  const { showSuccess, showError } = useNotification();
  const params = useLocalSearchParams();

  // Extract data from params
  const boardingHouseName = params.boardingHouseName;
  const roomTypeName = params.roomTypeName;
  const price = parseFloat(params.price) || 0;

  // Form state
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [rentalTime, setRentalTime] = useState("1");
  const [timeType, setTimeType] = useState("month");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    calculateEndDate(new Date(), 1, "month")
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Format options for room selection
  const roomOptions = roomData.map((room) => ({
    label: room.roomNumber,
    value: room._id,
  }));

  // Calculate end date based on rental time and type
  function calculateEndDate(start, time, type) {
    const startDate = new Date(start);
    if (type === "month") {
      return new Date(
        startDate.setMonth(startDate.getMonth() + parseInt(time))
      );
    } else {
      // year
      return new Date(
        startDate.setFullYear(startDate.getFullYear() + parseInt(time))
      );
    }
  }

  // Update end date when rental time or type changes
  useEffect(() => {
    if (rentalTime && timeType) {
      setEndDate(calculateEndDate(startDate, parseInt(rentalTime), timeType));
    }
  }, [rentalTime, timeType, startDate]);

  // Handle date picker changes
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Recalculate end date
      setEndDate(
        calculateEndDate(selectedDate, parseInt(rentalTime), timeType)
      );
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    if (!selectedRoomId) {
      newErrors.roomId = t("selectRoomRequired");
    }

    if (!rentalTime || parseInt(rentalTime) <= 0) {
      newErrors.rentalTime = t("rentalTimeMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle deposit submission
  const handleDeposit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const depositData = {
        roomId: selectedRoomId,
        rentalTime: parseInt(rentalTime),
        timeType: timeType,
        rentalDate: [
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd"),
        ],
      };

      const response = await depositRoom(depositData);
      showSuccess(t("successMessage"));
      // Navigate back or to success screen
      router.back();
    } catch (error) {
      console.error("Deposit error:", error);
      showError(error?.response?.data?.message || "Failed to process deposit");
    } finally {
      setLoading(false);
    }
  };

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
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-1">{boardingHouseName}</Text>
          <Text className="text-lg font-semibold mb-4">{roomTypeName}</Text>
          <Text className="text-xl text-orange-500 font-bold">
            {formatAmount(price)} {t("pricePerMonth")}
          </Text>
        </View>

        {/* Room Selection */}
        <Select
          label={t("selectRoom")}
          placeholder={t("selectRoom")}
          options={roomOptions}
          value={selectedRoomId}
          onChange={(value) => {
            setSelectedRoomId(value);
            if (errors.roomId) {
              setErrors((prev) => ({ ...prev, roomId: null }));
            }
          }}
          error={errors.roomId}
          required
        />

        {/* Rental Start Date */}
        <FormField label={t("rentalDate")} required containerClassName="mb-4">
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            className={`p-3 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text>
              {format(startDate, "dd/MM/yyyy")} -{" "}
              {format(endDate, "dd/MM/yyyy")}
            </Text>
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </FormField>

        {/* Rental Time */}
        <View className="mb-4">
          <Text className="text-base font-semibold mb-2">
            {t("rentalTime")} <Text style={{ color: "red" }}>*</Text>
          </Text>
          <View className="flex-row space-x-2">
            <View className="flex-1">
              <FormField
                placeholder={t("enterRentalTime")}
                value={rentalTime}
                onChange={(name, value) => {
                  // Only allow numbers
                  if (/^\d*$/.test(value)) {
                    setRentalTime(value);
                    if (errors.rentalTime) {
                      setErrors((prev) => ({ ...prev, rentalTime: null }));
                    }
                  }
                }}
                keyboardType="numeric"
                error={errors.rentalTime}
              />
            </View>

            <View className="w-1/3">
              <Select
                options={[
                  { label: t("month"), value: "month" },
                  { label: t("year"), value: "year" },
                ]}
                value={timeType}
                onChange={setTimeType}
              />
            </View>
          </View>
        </View>

        {/* Deposit Button */}
        <Button
          onPress={handleDeposit}
          loading={loading}
          fullWidth
          className="mt-8 mb-6"
        >
          {t("okText")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
