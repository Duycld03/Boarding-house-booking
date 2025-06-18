import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { FormField } from "@/components/form/index";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
// import { createReport } from "@/API/reportAPI"; // Update this path to your actual API file

const reasonOptionsKeys = {
  boardingHouse: ["scamRent", "falseAd", "privacy", "unfriendly", "security"],
  review: ["spam", "misleading", "privacy", "inappropriate"],
};

export default function ReportBoardingHouse({ route }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("report"); // Make sure you have this translation namespace
  const { showSuccess, showError } = useNotification();

  // Get parameters from route
  const boardingHouseId = route?.params?.boardingHouseId;
  const reviewId = route?.params?.reviewId;

  const [formData, setFormData] = useState({
    reason: "",
    detail: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.reason.trim()) {
      newErrors.reason = { message: t("report.reasonRequired") };
      isValid = false;
    }
    if (!formData.detail.trim()) {
      newErrors.detail = { message: t("report.detailRequired") };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const pickImage = async () => {
    if (images.length >= 6) {
      showError(t("report.uploadLimit") || "Maximum 6 images allowed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError(
        t("report.validationError") || "Please fill all required fields"
      );
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("reason", formData.reason);
      formDataObj.append("details", formData.detail);
      formDataObj.append("boardingHouseId", boardingHouseId);

      if (reviewId) {
        formDataObj.append("reviewId", reviewId);
      }

      images.forEach((image, index) => {
        const imageName = image.uri.split("/").pop();
        const imageType =
          "image/" + (imageName.split(".").pop() === "png" ? "png" : "jpeg");

        formDataObj.append("report", {
          uri: image.uri,
          name: imageName,
          type: imageType,
        });
      });

      // const response = await createReport(formDataObj);
      // showSuccess(
      //   response.message ||
      //     t("report.success") ||
      //     "Report submitted successfully"
      // );
      router.back();
    } catch (error) {
      console.error(error);
      // showError(
      //   error?.response?.data?.message ||
      //     t("report.error") ||
      //     "Failed to submit report"
      // );
    } finally {
      setLoading(false);
    }
  };

  // Get reason options based on whether it's a boarding house or review report
  const getReasonOptions = () => {
    const type = reviewId ? "review" : "boardingHouse";
    return reasonOptionsKeys[type].map((key) => ({
      value: t(`report.reasons.${type}.${key}`),
      label: t(`report.reasons.${type}.${key}`),
    }));
  };

  const reasonOptions = getReasonOptions();

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader
        title={t("report.title") || "Report boarding house"}
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
      />

      <ScrollContainer keyboardAvoiding className="px-4">
        {/* Using Dropdown Instead of Picker */}
        <View style={styles.formGroup}>
          <Text
            style={styles.label}
            className={isDarkMode ? "text-white" : "text-black"}
          >
            {t("report.reason") || "Reason"} *
          </Text>

          <Dropdown
            style={[
              styles.dropdown,
              isDarkMode && styles.dropdownDark,
              errors.reason && styles.errorInput,
            ]}
            containerStyle={[
              styles.dropdownContainer,
              isDarkMode && styles.dropdownContainerDark,
            ]}
            itemContainerStyle={[
              styles.dropdownItemContainer,
              isDarkMode && styles.dropdownItemContainerDark,
            ]}
            itemTextStyle={[
              styles.dropdownItemText,
              isDarkMode && styles.dropdownItemTextDark,
            ]}
            selectedTextStyle={[
              styles.selectedText,
              isDarkMode && styles.selectedTextDark,
              !formData.reason && styles.placeholderText,
            ]}
            iconStyle={styles.dropdownIcon}
            data={reasonOptions}
            placeholderStyle={styles.placeholderText}
            placeholder={t("report.selectReason") || "Select a reason"}
            labelField="label"
            valueField="value"
            value={formData.reason}
            onChange={(item) => {
              handleChange("reason", item.value);
            }}
          />

          {errors.reason && (
            <Text style={styles.errorText}>{errors.reason.message}</Text>
          )}
        </View>

        <FormField
          name="detail"
          label={t("report.detail") || "Details"}
          placeholder={t("report.enterDetail") || "Describe the issue"}
          value={formData.detail}
          onChange={handleChange}
          error={errors.detail}
          multiline={true}
          numberOfLines={4}
          required
        />

        <Text
          style={styles.imagesLabel}
          className={isDarkMode ? "text-white" : "text-black"}
        >
          {t("report.images") || "Images"} (Optional)
        </Text>

        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <AntDesign name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 6 && (
            <TouchableOpacity
              style={[
                styles.addImageButton,
                isDarkMode && styles.addImageButtonDark,
              ]}
              onPress={pickImage}
            >
              <AntDesign
                name="plus"
                size={24}
                color={isDarkMode ? "#fff" : "#333"}
              />
              <Text style={isDarkMode ? styles.textDark : styles.text}>
                {t("report.addImages") || "Add Images"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          className="mt-6 mb-8"
        >
          {t("report.submit") || "Submit Report"}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  // Dropdown styles
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownDark: {
    backgroundColor: "#111827",
    borderColor: "#555",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownContainerDark: {
    backgroundColor: "#111827",
    borderColor: "#555",
  },
  dropdownItemContainer: {
    backgroundColor: "#fff",
  },
  dropdownItemContainerDark: {
    backgroundColor: "#111827",
  },
  dropdownItemText: {
    color: "#333",
    fontSize: 16,
  },
  dropdownItemTextDark: {
    color: "#fff",
  },
  selectedText: {
    color: "#333",
    fontSize: 16,
  },
  selectedTextDark: {
    color: "#fff",
  },
  placeholderText: {
    color: "#aaa",
    fontSize: 16,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: "#333",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  imagesLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButtonDark: {
    borderColor: "#444",
  },
  text: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  textDark: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
  },
});
