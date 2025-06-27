import React, { useEffect, useState, useCallback } from 'react';
import ScreenContainer, { ScrollContainer } from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Input } from "@/components/ui";
import { updateReview, getReviewDetailUser } from "../../../API/reviewAPI";
import { useCurrentUser } from '@/context/userContext';

const MAX_IMAGES = 5;

const UpdateReview = () => {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation("review");
    const { showSuccess, showError } = useNotification();
    const { reviewId } = useLocalSearchParams();
    const { user, isLogin } = useCurrentUser();

    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingReview, setLoadingReview] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFiles, setNewFiles] = useState([]);
    const [reviewData, setReviewData] = useState(null);

    useEffect(() => {
        if (!reviewId) {
            showError("Review ID is missing");
            router.back();
            return;
        }
        fetchReview();
    }, [reviewId, isLogin]);

    const fetchReview = async () => {
        setLoadingReview(true);
        if (!reviewId) {
            showError("Review ID is missing");
            router.back();
            return;
        }

        try {
            if (!isLogin) {
                showError("You must be logged in.");
                router.push('/login');
                return;
            }

            const res = await getReviewDetailUser(reviewId);
            const data = res.data.review;

            if (!data) {
                throw new Error("Review data not found in response");
            }

            setReviewData(data);
            setRating(data.rating);
            setContent(data.content);
            setExistingImages(data.images || []);
        } catch (error) {
            console.error("Error fetching review data:", error);
            showError("Failed to load review data.");
            router.back();
        } finally {
            setLoadingReview(false);
        }
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImagePick = async () => {
        if (existingImages.length + newImages.length >= MAX_IMAGES) {
            showError("You can only upload up to 5 images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length) {
            setNewImages((prev) => [...prev, result.assets[0]]);
        }
    };

    const handleSubmit = async () => {
        if (!reviewData || !reviewData._id) {
            showError("Review data is missing or invalid.");
            return;
        }

        if (!content.trim() || rating === 0) {
            showError("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("rating", rating.toString());
            formData.append("content", content);
            existingImages.forEach((img, idx) => {
                formData.append(`existingImages[${idx}]`, img._id || img.imageUrl);
            });

            // Add new images picked from the gallery
            newImages.forEach((image, idx) => {
                const imageName = image.uri.split("/").pop();
                const imageType = "image/" + (imageName.split(".").pop() === "png" ? "png" : "jpeg");

                formData.append("images", {
                    uri: image.uri,
                    name: imageName,
                    type: imageType,
                });
            });


            // Correct API call with separate reviewId and formData
            const response = await updateReview(reviewId, formData);
            if (response.success) {
                showSuccess(t("review.successMessage") || "Review submitted successfully!");
                // showSuccess(response.message);
                router.back();
            } else {
                showError(response.message || t("review.submitError") || "Failed to submit the review.");
            }
        } catch (error) {
            console.error("Error updating review:", error.response?.data || error.message);
            showError("Failed to update the review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer withPadding={false}>
            <BackHeader title={t("review.titleUpdate")} />
            <ScrollContainer keyboardAvoiding className="px-4">
                {/* Rating Section */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        {t("review.rating")} <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={styles.ratingContainer}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                                <AntDesign
                                    name="star"
                                    size={30}
                                    color={index < rating ? "#FFD700" : "#ccc"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        {t("review.content")} <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <Input
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={4}
                        placeholder={t("review.contentPlaceholder") || "Write your review..."}
                        style={styles.textArea}
                    />
                </View>

                {/* Images Section */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>{t("review.images")}</Text>
                    <ScrollView horizontal>
                        {existingImages.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: image.imageUrl }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveExistingImage(index)}
                                >
                                    <AntDesign name="close" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {newImages.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: image.uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveNewImage(index)}
                                >
                                    <AntDesign name="close" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {existingImages.length + newImages.length < MAX_IMAGES && (
                            <TouchableOpacity style={[
                                styles.addImageButton,
                                isDarkMode && styles.addImageButtonDark,
                            ]}
                                onPress={handleImagePick}>
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

                {/* Submit Button */}
                <Button onPress={handleSubmit} loading={loading}>
                    {t("review.submit")}
                </Button>
            </ScrollContainer>
        </ScreenContainer>
    );
}
const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8
    },
    ratingContainer: {
        flexDirection: "row"
    },
    textArea: {
        borderRadius: 8,
        borderColor: "#ccc",
        textAlignVertical: "top",
    },
    imageWrapper: {
        position: "relative",
        marginRight: 10
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8
    },
    removeButton: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(255,0,0,0.7)",
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
export default UpdateReview;