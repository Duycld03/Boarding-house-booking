import React, { useState } from "react";
import { View, TouchableOpacity, Platform, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "react-native-feather";
import Text from "@/components/ui/Text";
import { useThemedClasses } from "@/utils/useTheme";
import { useTheme } from "@/context/ThemeProvider";

const CustomDatePicker = ({
  label,
  placeholder = "Select date",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  mode = "date", // 'date', 'time', 'datetime'
  format,
  minDate,
  maxDate,
  locale = "vi-VN",
}) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(
    value ? new Date(value) : new Date()
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  const errorMessage =
    error && typeof error === "object" && error[label]
      ? error[label].message
      : typeof error === "string"
      ? error
      : null;

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (format) {
      return format(date);
    }

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    if (mode === "time") {
      options.hour = "2-digit";
      options.minute = "2-digit";
      delete options.year;
      delete options.month;
      delete options.day;
    }

    if (mode === "datetime") {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    try {
      return date.toLocaleString(locale, options);
    } catch (error) {
      if (mode === "time") {
        return date.toLocaleTimeString();
      } else if (mode === "datetime") {
        return date.toLocaleString();
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setTempValue(value ? new Date(value) : new Date());
      setIsOpen(true);

      if (Platform.OS === "android" && mode === "datetime") {
        setShowTimePicker(false);
      }
    }
  };

  const closePicker = () => {
    setIsOpen(false);
    setShowTimePicker(false);
  };

  const handleIOSChange = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setTempValue(currentDate);
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempValue);
    closePicker();
  };

  const handleAndroidChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      closePicker();
      return;
    }

    if (selectedDate) {
      if (mode === "datetime" && !showTimePicker) {
        const newDate = new Date(selectedDate);

        if (value) {
          const currentDate = new Date(value);
          newDate.setHours(currentDate.getHours());
          newDate.setMinutes(currentDate.getMinutes());
        }

        setTempValue(newDate);
        setShowTimePicker(true);
      } else {
        let finalValue;

        if (mode === "datetime" && showTimePicker) {
          const newDate = new Date(tempValue);
          newDate.setHours(selectedDate.getHours());
          newDate.setMinutes(selectedDate.getMinutes());
          finalValue = newDate;
        } else {
          finalValue = selectedDate;
        }

        setTempValue(finalValue);
        onChange(finalValue);

        if (mode !== "datetime" || showTimePicker) {
          closePicker();
        }
      }
    }
  };

  const handleClear = () => {
    onChange(null);
    closePicker();
  };

  const DisplayIcon = mode === "time" ? Clock : Calendar;

  const renderDatePicker = () => {
    if (!isOpen) return null;

    const currentMode =
      Platform.OS === "android" && mode === "datetime"
        ? showTimePicker
          ? "time"
          : "date"
        : mode;

    if (Platform.OS === "ios") {
      return (
        <Modal
          visible={isOpen}
          transparent
          animationType="slide"
          onRequestClose={closePicker}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closePicker}
            className="flex-1 justify-end bg-black bg-opacity-50"
          >
            <View className={`${themedClasses.bg} rounded-t-xl`}>
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <TouchableOpacity onPress={handleClear}>
                  <Text
                    className="text-red-500"
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>

                <Text
                  className={`${themedClasses.text} font-medium`}
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  {mode === "date"
                    ? "Select Date"
                    : mode === "time"
                    ? "Select Time"
                    : "Select Date & Time"}
                </Text>

                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text
                    className={`${
                      isDarkMode ? "text-primary-dark" : "text-primary-light"
                    }`}
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempValue || new Date()}
                mode={mode === "datetime" ? "date" : mode}
                display="spinner"
                onChange={handleIOSChange}
                minimumDate={minDate ? new Date(minDate) : undefined}
                maximumDate={maxDate ? new Date(maxDate) : undefined}
                textColor={isDarkMode ? "#f9fafb" : "#111827"}
                locale={locale}
              />

              {mode === "datetime" && (
                <DateTimePicker
                  value={tempValue || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleIOSChange}
                  textColor={isDarkMode ? "#f9fafb" : "#111827"}
                  locale={locale}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      );
    }

    return (
      <DateTimePicker
        value={tempValue || new Date()}
        mode={currentMode}
        is24Hour={true}
        display="default"
        onChange={handleAndroidChange}
        minimumDate={minDate ? new Date(minDate) : undefined}
        maximumDate={maxDate ? new Date(maxDate) : undefined}
      />
    );
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <View className="flex-row mb-1">
          <Text
            className={`${themedClasses.text} text-sm font-medium`}
            style={{ fontFamily: "Poppins-Medium" }}
          >
            {label}
          </Text>
          {required && (
            <Text
              className="ml-0.5"
              style={{ color: "red", fontFamily: "Poppins-Medium" }}
            >
              *
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={openPicker}
        disabled={disabled}
        className={`
          flex-row justify-between items-center px-4 py-3 rounded-lg
          border
          ${
            errorMessage
              ? "border-red-500"
              : `${isDarkMode ? "border-gray-700" : "border-gray-300"}`
          }
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <Text
          className={`flex-1 ${
            value ? themedClasses.text : "text-gray-400 dark:text-gray-500"
          }`}
          style={{ fontFamily: "Poppins-Regular" }}
        >
          {value ? formatDate(value) : placeholder}
        </Text>

        <DisplayIcon
          width={20}
          height={20}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
        />
      </TouchableOpacity>

      {errorMessage && (
        <Text variant="caption" className="mt-1" color="#EF4444">
          {errorMessage}
        </Text>
      )}

      {renderDatePicker()}
    </View>
  );
};

export default CustomDatePicker;
