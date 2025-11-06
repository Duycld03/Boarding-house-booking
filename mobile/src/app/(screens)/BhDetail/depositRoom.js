import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  ActivityIndicator,
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
import { getRoomsByRoomType } from "@/API/roomAPI";

export default function DepositRoom() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("depositRoom");
  const { showSuccess, showError } = useNotification();
  const params = useLocalSearchParams();

  // Parse roomData from params
  const roomData =
    typeof params.roomData === "string"
      ? JSON.parse(params.roomData)
      : params.roomData;

  // Get roomTypeId and price directly from params
  const roomTypeId = roomData?._id;
  const roomTypeName = roomData?.typeName;
  const price = roomData?.price;

  // States
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [rentalTime, setRentalTime] = useState("1");
  const [timeType, setTimeType] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(
    calculateEndDate(new Date(), 1, "month")
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch rooms data
  const fetchRoomsByRoomTypeId = async () => {
    try {
      const res = await getRoomsByRoomType(roomTypeId);
      setRoomsList(res);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showError(t("fetchRoomsError") || "Failed to load available rooms");
    }
  };

  // Load initial data
  useEffect(() => {
    if (roomTypeId) {
      setInitialLoading(true);
      fetchRoomsByRoomTypeId().finally(() => {
        setInitialLoading(false);
      });
    } else {
      showError("Room type ID is missing");
      router.back();
    }
  }, [roomTypeId]);

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
      setEndDate(
        calculateEndDate(selectedDate, parseInt(rentalTime), timeType)
      );
    }
  };

  // Handle room selection
  const handleRoomChange = (roomId) => {
    setSelectedRoomId(roomId);
    if (errors.roomId) {
      setErrors((prev) => ({ ...prev, roomId: null }));
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
        price: price, // Use price directly from params
      };

      const response = await depositRoom(depositData);
      showSuccess(t("successMessage"));
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to process deposit");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching initial data
  if (initialLoading) {
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff7a45" />
          <Text className="mt-4">{t("loading") || "Loading..."}</Text>
        </View>
      </ScreenContainer>
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
        {/* Room Selection */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"
              }`}
          >
            {t("selectRoom")} <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            className={`border rounded-lg p-4 ${isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-300 bg-white"
              } ${errors.roomId ? "border-red-500" : ""}`}
            onPress={() => setShowRoomPicker(true)}
          >
            <Text
              className={`text-base ${isDarkMode ? "text-gray-200" : "text-black"
                } ${!selectedRoomId ? "opacity-60" : ""}`}
            >
              {selectedRoomId
                ? roomsList.find((room) => room._id === selectedRoomId)
                  ?.roomNumber
                : t("selectRoom")}
            </Text>
          </TouchableOpacity>
          {errors.roomId ? (
            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
              {errors.roomId}
            </Text>
          ) : null}

          <Modal
            visible={showRoomPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowRoomPicker(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50 justify-end"
              activeOpacity={1}
              onPress={() => setShowRoomPicker(false)}
            >
              <View
                className={`rounded-t-3xl max-h-[80%] ${isDarkMode ? "bg-gray-900" : "bg-white"
                  }`}
              >
                <View
                  className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                >
                  <Text
                    className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {t("selectRoom")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRoomPicker(false)}
                    className="p-1"
                  >
                    <Text
                      className={`text-xl ${isDarkMode ? "text-white" : "text-black"
                        }`}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView className="p-4">
                  {roomsList.length > 0 ? (
                    roomsList.map((room) => (
                      <TouchableOpacity
                        key={room._id}
                        className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
                          } ${selectedRoomId === room._id
                            ? isDarkMode
                              ? "bg-gray-700"
                              : "bg-gray-100"
                            : ""
                          }`}
                        onPress={() => {
                          handleRoomChange(room._id);
                          setShowRoomPicker(false);
                        }}
                      >
                        <Text
                          className={`text-base ${selectedRoomId === room._id ? "font-semibold" : ""
                            } ${isDarkMode ? "text-white" : "text-black"}`}
                        >
                          {room.roomNumber}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text
                      className={`text-center p-4 ${isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                    >
                      {t("noRoomsAvailable") || "No rooms available"}
                    </Text>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Rest of the code remains the same */}
        {/* Rental Start Date */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"
              }`}
          >
            {t("rentalDate")} <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            className={`p-4 border rounded-lg ${isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-300 bg-white"
              }`}
          >
            <Text className={isDarkMode ? "text-white" : "text-black"}>
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
              minimumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // Minimum 7 days from today
            />
          )}
        </View>

        {/* Rental Time */}
        <View className="mb-5">
          <Text
            className={`text-base font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"
              }`}
          >
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
              <TouchableOpacity
                className={`border rounded-lg p-2 ml-2 h-[42px] justify-center items-center ${isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-300 bg-white"
                  }`}
                onPress={() => {
                  // Toggle between month and year
                  setTimeType(timeType === "month" ? "year" : "month");
                }}
              >
                <Text
                  className={`text-base text-center ${isDarkMode ? "text-gray-200" : "text-black"
                    }`}
                >
                  {timeType === "month" ? t("month") : t("year")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.rentalTime && (
            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
              {errors.rentalTime}
            </Text>
          )}
        </View>

        {/* Deposit Button */}
        <Button
          onPress={handleDeposit}
          loading={loading}
          fullWidth
          className="mt-6 mb-8"
        >
          {t("okText")}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
