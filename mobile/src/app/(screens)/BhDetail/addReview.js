import React, { useEffect, useState, useCallback } from 'react';
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
    ScrollView,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Input } from "@/components/ui";
import { addReview } from "../../../API/reviewAPI"; // Update this path to your actual API file
import { ConfirmModal } from '@/components/feedback';
import { useCurrentUser } from '@/context/userContext';
import { useFocusEffect } from 'expo-router';

const AddReview = () => {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation("review");
    const { showSuccess, showError } = useNotification();

    const { boardingHouseId } = useLocalSearchParams();

    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user, isLogin, isLoading } = useCurrentUser();

    useFocusEffect(
        useCallback(() => {
            if (!isLogin) {
                router.replace('/login'); // or router.push('/login') depending on your routing structure
                return;
            }
        }, [isLogin, router])
    );
    const handleImagePick = async () => {
        if (images.length >= 5) {
            showError(
                t("review.imageLimit") || "You can only upload up to 5 images."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages([...images, result.assets[0]]);
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!boardingHouseId) {
            showError(t("review.boardingHouseIdMissing") || "Boarding house ID is missing.");
            return false;
        }
        if (rating === 0) {
            showError(t("review.ratingRequired") || "Rating is required.");
            return false;
        }
        if (!content.trim()) {
            showError(t("review.contentRequired") || "Review content is required.");
            return false;
        }
        return true;
    };
    const handleConfirmLogin = () => {
        setShowLoginModal(false);
        router.push('/login');
    };

    const handleCancelLogin = () => {
        setShowLoginModal(false);
    };

    const handleSubmit = async () => {
        if (user == null) {
            setShowLoginModal(true);
            return;
        }
        if (!user) {
            setShowLoginModal(true); // Hiển thị modal yêu cầu đăng nhập
            return;
        }
        if (!validateForm()) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("boardingHouseId", boardingHouseId);
            formData.append("rating", rating.toString());
            formData.append("content", content);

            images.forEach((image) => {
                const imageName = image.uri.split("/").pop();
                const imageType =
                    "image/" + (imageName.split(".").pop() === "png" ? "png" : "jpeg");

                formData.append("images", {
                    uri: image.uri,
                    name: imageName,
                    type: imageType,
                });
            });

            for (const pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }

            const response = await addReview(formData);

            if (response.success) {
                showSuccess(t("review.successMessage") || "Review submitted successfully!");
                router.back();
            } else {
                showError(response.message || t("review.submitError") || "Failed to submit the review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error.response?.data || error.message);
            showError(error.response?.data?.message || "Failed to submit the review.");

        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer withPadding={false}>
            <BackHeader
                title={t("review.titleAdd") || "Add Review"}
                backIcon={
                    <AntDesign name="left" size={20} color={isDarkMode ? "#fff" : "#333"} />
                }
            />
            <ScrollContainer keyboardAvoiding className="px-4">
                <View style={styles.formGroup}>
                    <Text
                        style={[
                            styles.label,
                            { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                    >
                        {t("review.rating")} <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={styles.ratingContainer}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setRating(index + 1)}
                                style={styles.starButton}
                            >
                                <AntDesign
                                    name="star"
                                    size={30}
                                    color={index < rating ? "#FFD700" : isDarkMode ? "#555" : "#ccc"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text
                        style={[
                            styles.label,
                            { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                    >
                        {t("review.content")} <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <Input
                        value={content}
                        onChangeText={setContent}
                        placeholder={t("review.contentPlaceholder") || "Write your review..."}
                        multiline
                        numberOfLines={4}
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                                color: isDarkMode ? "#fff" : "#000",
                            },
                        ]}
                        placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text
                        style={[
                            styles.label,
                            { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                    >
                        {t("review.images")} <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <ScrollView horizontal style={styles.imageScroll}>
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
                        {images.length < 5 && (
                            <TouchableOpacity
                                style={[
                                    styles.addImageButton,
                                    isDarkMode && styles.addImageButtonDark,
                                ]}
                                onPress={handleImagePick}
                            >
                                <AntDesign
                                    name="plus"
                                    size={24}
                                    color={isDarkMode ? "#fff" : "#333"}
                                />
                                <Text style={isDarkMode ? styles.textDark : styles.text}>
                                    {t("review.addImages") || "Add Images"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                <Button
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                    className="mt-6 mb-8"
                >
                    {t("review.submit") || "Submit Review"}
                </Button>

            </ScrollContainer>
            <ConfirmModal
                visible={showLoginModal}
                title={t("review.loginRequired") || "Login Required"}
                message={t("review.loginToReview") || "You need to login to submit a review"}
                confirmText={t("review.login") || "Login"}
                cancelText={t("review.cancel") || "Cancel"}
                onConfirm={handleConfirmLogin}
                onCancel={handleCancelLogin}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    textArea: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        textAlignVertical: "top",
    },
    imageScroll: {
        flexDirection: "row",
        marginTop: 8,
    },
    imageWrapper: {
        position: "relative",
        marginRight: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
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
        borderWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    addImageButtonDark: {
        borderColor: "#555",
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

export default AddReview;