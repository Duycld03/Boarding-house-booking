import React, { useState } from "react";
import ScreenContainer, {
  ScrollContainer,
} from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createReport } from "@/API/reportAPI"; // Update this path to your actual API file
import { Input } from "@/components/ui";

const reasonOptionsKeys = {
  boardingHouse: ["scamRent", "falseAd", "privacy", "unfriendly", "security"],
  review: ["spam", "misleading", "privacy", "inappropriate"],
};

export default function Report() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("report");
  const { showSuccess, showError } = useNotification();

  const { boardingHouseId, reviewId } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [detail, setDetail] = useState("");

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
    if (!detail.trim()) {
      newErrors.detail = { message: t("report.detailRequired") };
      isValid = false;
    }

    if (images.length === 0) {
      newErrors.images = {
        message: t("report.imagesRequired") || "At least one image is required",
      };
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
      mediaTypes: ImagePicker.MediaTypes,
      allowsEditing: true,
      // aspect: [4, 3],
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
      formDataObj.append("details", detail);
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

      const response = await createReport(formDataObj);
      showSuccess(t("report.success") || "Report submitted successfully");
      router.back();
    } catch (error) {
      showError(t("report.error") || "Failed to submit report");
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
        {/* Reason Selection with Modal */}
        <View className="mb-4">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {t("report.reason") || "Reason"}{" "}
            <Text style={{ color: "red" }}>*</Text>
          </Text>

          <TouchableOpacity
            className={`border rounded-lg p-4 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-300 bg-white"
            } ${errors.reason ? "border-red-500" : ""}`}
            onPress={() => setShowReasonPicker(true)}
          >
            <Text
              className={`text-base ${
                isDarkMode ? "text-gray-200" : "text-black"
              } ${!formData.reason ? "opacity-60" : ""}`}
            >
              {formData.reason
                ? formData.reason
                : t("report.selectReason") || "Select a reason"}
            </Text>
          </TouchableOpacity>

          {errors.reason && (
            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
              {errors.reason.message}
            </Text>
          )}

          <Modal
            visible={showReasonPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowReasonPicker(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50 justify-end"
              activeOpacity={1}
              onPress={() => setShowReasonPicker(false)}
            >
              <View
                className={`rounded-t-3xl max-h-[80%] ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <View
                  className={`flex-row justify-between items-center p-4 border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {t("report.selectReason") || "Select a reason"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowReasonPicker(false)}
                    className="p-1"
                  >
                    <Text
                      className={`text-xl ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView className="p-4">
                  {reasonOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className={`p-4 border-b ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      } ${
                        formData.reason === option.value
                          ? isDarkMode
                            ? "bg-gray-700"
                            : "bg-gray-100"
                          : ""
                      }`}
                      onPress={() => {
                        handleChange("reason", option.value);
                        setShowReasonPicker(false);
                      }}
                    >
                      <Text
                        className={`text-base ${
                          formData.reason === option.value
                            ? "font-semibold"
                            : ""
                        } ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View className="mb-4">
          <Text
            className={`text-base font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {t("report.detail") || "Details"}{" "}
            <Text style={{ color: "red" }}>*</Text>
          </Text>

          <Input
            value={detail}
            onChangeText={(text) => setDetail(text)}
            placeholder={t("report.enterDetail") || "Describe the issue"}
            multiline
            numberOfLines={4}
            className={`min-h-[100px] text-top border rounded-lg p-3 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-gray-200"
                : "border-gray-300 bg-white text-black"
            } ${errors.note ? "border-red-500" : ""}`}
            style={{ textAlignVertical: "top" }}
            error={errors.detail ? errors.detail.message : null}
          />
          {errors.detail ? (
            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
              {errors.detail.message}
            </Text>
          ) : null}
        </View>

        <Text
          className={`text-base font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {t("report.images") || "Images"}{" "}
          <Text style={{ color: "red" }}>*</Text>
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
    padding: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    // backgroundColor: "#",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bdbdbd",
  },
  addImageButtonDark: {
    // backgroundColor: "#424242",
    borderColor: "#757575",
  },
  text: {
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
    marginTop: 4,
  },
  textDark: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    marginTop: 4,
  },
});
