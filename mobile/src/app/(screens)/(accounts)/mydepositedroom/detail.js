// Tạo mobile/src/app/(screens)/(accounts)/mydepositedroom/detail.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Text as RNText,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import ScreenContainer from "@/components/layout/ScreenContainer";
import { BackHeader } from "@/components/navigation/CustomHeader";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeProvider";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getDepositRoomDetail } from "@/API/depositAPI";
import { getMyRefundRequests } from "@/API/refundRequestAPI";
import { useCurrentUser } from "@/context/userContext";
import formatAmount from "@/utils/formatAmount";

const { width: screenWidth } = Dimensions.get("window");

export default function DepositRoomDetail() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation("depositRoomDetail");
  const { showSuccess, showError } = useNotification();
  const { isLogin } = useCurrentUser();
  const { depositId } = useLocalSearchParams();

  // State
  const [depositDetail, setDepositDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refundRequestInfo, setRefundRequestInfo] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Get current language
  const currentLanguage = i18n.language || "vi";

  // Check login status
  useEffect(() => {
    if (!isLogin) {
      router.replace("/login");
      return;
    }
  }, [isLogin, router]);

  // Fetch deposit detail
  const fetchDepositDetail = useCallback(async () => {
    if (!depositId) {
      showError("Invalid deposit ID");
      router.back();
      return;
    }

    try {
      setLoading(true);

      const response = await getDepositRoomDetail(depositId);

      if (response.success) {
        setDepositDetail(response.data);

        // Check for refund request
        try {
          const refundResponse = await getMyRefundRequests();
          const refundInfo = refundResponse.refundRequests?.[depositId];
          setRefundRequestInfo(refundInfo);
        } catch (refundError) {
          console.error("Error fetching refund requests:", refundError);
        }
      } else {
        throw new Error(response.message || "Failed to fetch deposit details");
      }
    } catch (error) {
      console.error("Error fetching deposit detail:", error);
      showError(error.message || "Failed to fetch deposit details");
      router.back();
    } finally {
      setLoading(false);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [depositId, router, showError, fadeAnim, slideAnim]);

  // Initial fetch
  useEffect(() => {
    fetchDepositDetail();
  }, [fetchDepositDetail]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDepositDetail();
    setRefreshing(false);
  }, [fetchDepositDetail]);

  // Helper functions
  const formatCurrency = (value) => {
    return formatAmount(value, currentLanguage, {
      showCurrency: true,
      showFullFormat: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return isDarkMode ? "#22c55e" : "#16a34a";
      case "accepted":
        return isDarkMode ? "#3b82f6" : "#2563eb";
      case "pending":
        return isDarkMode ? "#f59e0b" : "#d97706";
      case "rejected":
        return isDarkMode ? "#ef4444" : "#dc2626";
      default:
        return isDarkMode ? "#6b7280" : "#4b5563";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return "verified";
      case "accepted":
        return "check-circle";
      case "pending":
        return "schedule";
      case "rejected":
        return "cancel";
      default:
        return "help";
    }
  };

  // Render image gallery
  const renderImageGallery = () => {
    if (!depositDetail?.images) {
      return (
        <View
          style={[
            styles.noImageContainer,
            { backgroundColor: isDarkMode ? "#374151" : "#f3f4f6" },
          ]}
        >
          <MaterialIcons
            name="image-not-supported"
            size={64}
            color={isDarkMode ? "#6b7280" : "#9ca3af"}
          />
          <RNText
            style={[
              styles.noImageText,
              { color: isDarkMode ? "#9ca3af" : "#6b7280" },
            ]}
          >
            No images available
          </RNText>
        </View>
      );
    }

    // Process images - single object to array
    let images = [];
    if (Array.isArray(depositDetail.images)) {
      images = depositDetail.images;
    } else if (
      depositDetail.images &&
      typeof depositDetail.images === "object"
    ) {
      images = [depositDetail.images];
    }

    if (images.length === 0) {
      return (
        <View
          style={[
            styles.noImageContainer,
            { backgroundColor: isDarkMode ? "#374151" : "#f3f4f6" },
          ]}
        >
          <MaterialIcons
            name="image-not-supported"
            size={64}
            color={isDarkMode ? "#6b7280" : "#9ca3af"}
          />
          <RNText
            style={[
              styles.noImageText,
              { color: isDarkMode ? "#9ca3af" : "#6b7280" },
            ]}
          >
            No images available
          </RNText>
        </View>
      );
    }

    return (
      <View style={styles.imageGalleryContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentImageIndex(index);
          }}
          contentContainerStyle={styles.imageScrollContainer}
        >
          {images.map((image, index) => {
            const imageUrl = image?.imageUrl || image?.url || image;

            return (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={[styles.image, { width: screenWidth - 32 }]}
                onError={(error) => {
                  console.log("Image load error:", error);
                }}
                onLoad={() => {}}
              />
            );
          })}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentImageIndex
                        ? "#3b82f6"
                        : isDarkMode
                        ? "#6b7280"
                        : "#d1d5db",
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    if (!depositDetail) return null;

    if (depositDetail.status === "accepted") {
      return (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2563eb" }]}
            onPress={handlePayDeposit}
          >
            <FontAwesome name="dollar" size={20} color="#fff" />
            <RNText style={styles.actionButtonText}>Pay Deposit</RNText>
          </TouchableOpacity>
        </View>
      );
    }

    if (
      depositDetail.status === "confirmed" &&
      parseInt(depositDetail.rentalTime) >= 2 &&
      !refundRequestInfo
    ) {
      return (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#dc2626" }]}
            onPress={handleRefund}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <RNText style={styles.actionButtonText}>Request Refund</RNText>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Handle actions
  const handleRefund = () => {
    if (refundRequestInfo) {
      showError("A refund request already exists for this deposit");
      return;
    }

    router.push({
      pathname: "/mydepositedroom/refundRequest",
      params: { depositId },
    });
  };

  const handlePayDeposit = () => {
    router.push({
      pathname: "/mydepositedroom/payDeposit",
      params: { deposit: JSON.stringify(depositDetail) },
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <BackHeader
          title="Deposit Detail"
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? "#fff" : "#333"}
            />
          }
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <RNText
            style={[
              styles.loadingText,
              { color: isDarkMode ? "#9ca3af" : "#6b7280" },
            ]}
          >
            Loading...
          </RNText>
        </View>
      </ScreenContainer>
    );
  }

  if (!depositDetail) {
    return (
      <ScreenContainer>
        <BackHeader
          title="Deposit Detail"
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? "#fff" : "#333"}
            />
          }
        />
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={64} color="#ef4444" />
          <RNText style={styles.errorText}>Deposit not found</RNText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BackHeader
        title="Deposit Detail"
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
      />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDarkMode ? "#3b82f6" : "#1d4ed8"]}
              tintColor={isDarkMode ? "#3b82f6" : "#1d4ed8"}
              progressBackgroundColor={isDarkMode ? "#1f2937" : "#ffffff"}
            />
          }
        >
          {/* Image Gallery */}
          {renderImageGallery()}

          {/* Main Info Card */}
          <LinearGradient
            colors={
              isDarkMode ? ["#1f2937", "#111827"] : ["#ffffff", "#f9fafb"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.infoCard, styles.shadow]}
          >
            <View style={styles.infoCardContent}>
              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.headerInfo}>
                  <RNText
                    style={[
                      styles.title,
                      { color: isDarkMode ? "#f3f4f6" : "#111827" },
                    ]}
                  >
                    {depositDetail.boardingHouseName}
                  </RNText>
                  <RNText
                    style={[
                      styles.subtitle,
                      { color: isDarkMode ? "#d1d5db" : "#4b5563" },
                    ]}
                  >
                    Room {depositDetail.roomNumber}
                  </RNText>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(
                        depositDetail.status
                      )}20`,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={getStatusIcon(depositDetail.status)}
                    size={16}
                    color={getStatusColor(depositDetail.status)}
                  />
                  <RNText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(depositDetail.status) },
                    ]}
                  >
                    {depositDetail.status}
                  </RNText>
                </View>
              </View>

              {/* Boarding House Type */}
              <View style={styles.typeContainer}>
                <MaterialIcons
                  name="category"
                  size={16}
                  color={isDarkMode ? "#9ca3af" : "#6b7280"}
                />
                <RNText
                  style={[
                    styles.typeText,
                    { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  {depositDetail.boardingHouseType}
                </RNText>
              </View>

              {/* Divider */}
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
                style={styles.divider}
              />

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                {/* Deposit Amount */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: isDarkMode ? "#1e40af" : "#dbeafe" },
                      ]}
                    >
                      <FontAwesome
                        name="money"
                        size={16}
                        color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                      />
                    </View>
                    <RNText
                      style={[
                        styles.detailLabel,
                        { color: isDarkMode ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      Deposit Amount
                    </RNText>
                  </View>
                  <RNText
                    style={[
                      styles.detailValue,
                      { color: isDarkMode ? "#f3f4f6" : "#111827" },
                    ]}
                  >
                    {formatCurrency(depositDetail.amount)}
                  </RNText>
                </View>

                {/* Rental Time */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: isDarkMode ? "#7c3aed" : "#ede9fe" },
                      ]}
                    >
                      <MaterialIcons
                        name="timer"
                        size={16}
                        color={isDarkMode ? "#c084fc" : "#a855f7"}
                      />
                    </View>
                    <RNText
                      style={[
                        styles.detailLabel,
                        { color: isDarkMode ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      Rental Time
                    </RNText>
                  </View>
                  <RNText
                    style={[
                      styles.detailValue,
                      { color: isDarkMode ? "#f3f4f6" : "#111827" },
                    ]}
                  >
                    {depositDetail.rentalTime} months
                  </RNText>
                </View>

                {/* Period */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: isDarkMode ? "#059669" : "#d1fae5" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="calendar-range"
                        size={16}
                        color={isDarkMode ? "#4ade80" : "#22c55e"}
                      />
                    </View>
                    <RNText
                      style={[
                        styles.detailLabel,
                        { color: isDarkMode ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      Period
                    </RNText>
                  </View>
                  <View style={styles.periodContainer}>
                    <RNText
                      style={[
                        styles.detailValue,
                        { color: isDarkMode ? "#f3f4f6" : "#111827" },
                      ]}
                    >
                      {formatDate(depositDetail.startDate)}
                    </RNText>
                    <RNText
                      style={[
                        styles.periodSeparator,
                        { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                      ]}
                    >
                      to
                    </RNText>
                    <RNText
                      style={[
                        styles.detailValue,
                        { color: isDarkMode ? "#f3f4f6" : "#111827" },
                      ]}
                    >
                      {formatDate(depositDetail.endDate)}
                    </RNText>
                  </View>
                </View>

                {/* Monthly Price */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: isDarkMode ? "#dc2626" : "#fecaca" },
                      ]}
                    >
                      <MaterialIcons
                        name="attach-money"
                        size={16}
                        color={isDarkMode ? "#fb7185" : "#f43f5e"}
                      />
                    </View>
                    <RNText
                      style={[
                        styles.detailLabel,
                        { color: isDarkMode ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      Monthly Price
                    </RNText>
                  </View>
                  <RNText
                    style={[
                      styles.detailValue,
                      { color: isDarkMode ? "#f3f4f6" : "#111827" },
                    ]}
                  >
                    {formatCurrency(depositDetail.price)}
                  </RNText>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Refund Request Info */}
          {refundRequestInfo && (
            <LinearGradient
              colors={
                isDarkMode ? ["#7c2d12", "#451a03"] : ["#fef3c7", "#fde68a"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.refundCard, styles.shadow]}
            >
              <View style={styles.refundCardContent}>
                <View style={styles.refundHeader}>
                  <MaterialIcons
                    name="assignment-return"
                    size={20}
                    color={isDarkMode ? "#fb923c" : "#f97316"}
                  />
                  <RNText
                    style={[
                      styles.refundTitle,
                      { color: isDarkMode ? "#fed7aa" : "#92400e" },
                    ]}
                  >
                    Refund Request
                  </RNText>
                </View>
                <RNText
                  style={[
                    styles.refundText,
                    { color: isDarkMode ? "#fbbf24" : "#b45309" },
                  ]}
                >
                  Status: {refundRequestInfo.status}
                </RNText>
                {refundRequestInfo.reason && (
                  <RNText
                    style={[
                      styles.refundReason,
                      { color: isDarkMode ? "#fbbf24" : "#b45309" },
                    ]}
                  >
                    Reason: {refundRequestInfo.reason}
                  </RNText>
                )}
              </View>
            </LinearGradient>
          )}

          {/* Action Buttons */}
          {renderActionButtons()}
        </ScrollView>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
  },
  // Image Gallery
  imageGalleryContainer: {
    marginBottom: 24,
  },
  imageScrollContainer: {
    alignItems: "center",
  },
  image: {
    height: 250,
    borderRadius: 16,
    resizeMode: "cover",
  },
  noImageContainer: {
    height: 250,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Info Card
  infoCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  infoCardContent: {
    padding: 24,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  typeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  periodContainer: {
    alignItems: "flex-end",
  },
  periodSeparator: {
    fontSize: 12,
    marginVertical: 2,
  },
  // Refund Card
  refundCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  refundCardContent: {
    padding: 16,
  },
  refundHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  refundTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  refundText: {
    fontSize: 14,
    marginBottom: 4,
  },
  refundReason: {
    fontSize: 14,
  },
  // Action Buttons
  actionContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
