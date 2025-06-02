import React, { useState } from "react";
import { View, TouchableOpacity, Platform, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "react-native-feather";
import Text from "@/components/ui/Text";
import { useThemedClasses } from "@/utils/useTheme";
import { useTheme } from "@/context/ThemeProvider";
import i18n from "@/config-translation/config-translation";

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
  const currentLanguage = i18n.language;

  // Đa ngôn ngữ cho các text trong component
  const getLocalizedText = (key) => {
    const texts = {
      'vi': {
        clear: 'Xóa',
        done: 'Xong',
        selectDate: 'Chọn ngày',
        selectTime: 'Chọn giờ',
        selectDateTime: 'Chọn ngày & giờ',
        selectDatePlaceholder: 'Chọn ngày',
        selectTimePlaceholder: 'Chọn giờ',
        selectDateTimePlaceholder: 'Chọn ngày & giờ',
      },
      'en': {
        clear: 'Clear',
        done: 'Done',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        selectDateTime: 'Select Date & Time',
        selectDatePlaceholder: 'Select date',
        selectTimePlaceholder: 'Select time',
        selectDateTimePlaceholder: 'Select date & time',
      }
    };

    const currentTexts = texts[currentLanguage] || texts['en'];
    return currentTexts[key] || key;
  };

  // Xác định locale dựa trên ngôn ngữ hiện tại
  const getDatePickerLocale = () => {
    switch (currentLanguage) {
      case 'vi':
        return 'vi-VN';
      case 'en':
        return 'en-US';
      case 'ja':
        return 'ja-JP';
      case 'ko':
        return 'ko-KR';
      case 'zh':
        return 'zh-CN';
      case 'th':
        return 'th-TH';
      default:
        return locale || 'en-US';
    }
  };

  // Xác định placeholder dựa trên mode và ngôn ngữ
  const getPlaceholder = () => {
    if (placeholder !== "Select date") {
      return placeholder; // Sử dụng placeholder tùy chỉnh nếu được cung cấp
    }

    switch (mode) {
      case 'time':
        return getLocalizedText('selectTimePlaceholder');
      case 'datetime':
        return getLocalizedText('selectDateTimePlaceholder');
      default:
        return getLocalizedText('selectDatePlaceholder');
    }
  };

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

    const datePickerLocale = getDatePickerLocale();
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
      return date.toLocaleString(datePickerLocale, options);
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

    const datePickerLocale = getDatePickerLocale();

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
                    {getLocalizedText('clear')}
                  </Text>
                </TouchableOpacity>

                <Text
                  className={`${themedClasses.text} font-medium`}
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  {mode === "date"
                    ? getLocalizedText('selectDate')
                    : mode === "time"
                      ? getLocalizedText('selectTime')
                      : getLocalizedText('selectDateTime')}
                </Text>

                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text
                    className={`${isDarkMode ? "text-primary-dark" : "text-primary-light"
                      }`}
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    {getLocalizedText('done')}
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
                locale={datePickerLocale}
              />

              {mode === "datetime" && (
                <DateTimePicker
                  value={tempValue || new Date()}
                  mode="time"
                  display="spinner"

                  onChange={handleIOSChange}
                  textColor={isDarkMode ? "#f9fafb" : "#111827"}
                  locale={datePickerLocale}
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
          ${errorMessage
            ? "border-red-500"
            : `${isDarkMode ? "border-gray-700" : "border-gray-300"}`
          }
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <Text
          className={`flex-1 ${value ? themedClasses("text-gray-400", "text-gray-500") : ""}`}
        >
          {value ? formatDate(value) : getPlaceholder()}
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