import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ScrollContainer } from "@/components/layout";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { Text, Loader } from "@/components/ui";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";
import { useTranslation } from "react-i18next";
import { getMyDepositedRoom } from "@/API/depositAPI";
import { useNotification } from "@/context/NotificationProvider";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { useCurrentUser } from "@/context/userContext";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Animated Deposit Card Component
const DepositCard = ({ item, onPayRent, onRefund, index }) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation("myDepositedRoom");
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, index]);

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return isDarkMode ? "#22c55e" : "#16a34a"; // Green
      case "pending":
        return isDarkMode ? "#f59e0b" : "#d97706"; // Amber
      case "rejected":
        return isDarkMode ? "#ef4444" : "#dc2626"; // Red
      case "cancelled":
        return isDarkMode ? "#6b7280" : "#4b5563"; // Gray
      default:
        return isDarkMode ? "#3b82f6" : "#2563eb"; // Blue
    }
  };

  // Status icons
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <MaterialIcons
            name="verified"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "pending":
        return (
          <MaterialCommunityIcons
            name="progress-clock"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "rejected":
        return (
          <MaterialIcons
            name="cancel"
            size={14}
            color={getStatusColor(status)}
          />
        );
      case "cancelled":
        return (
          <MaterialIcons
            name="do-not-disturb"
            size={14}
            color={getStatusColor(status)}
          />
        );
      default:
        return (
          <AntDesign name="question" size={14} color={getStatusColor(status)} />
        );
    }
  };

  // Add this formatDate function to display dates in dd/mm/yyyy format
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Check if the date is already in dd/mm/yyyy format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Otherwise parse and format the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Add this function to check if refund should be available
  const shouldShowRefund = (endDateStr) => {
    if (!endDateStr) return false;

    let endDate;

    // Check if the date is in dd/mm/yyyy format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(endDateStr)) {
      const [day, month, year] = endDateStr.split("/").map(Number);
      endDate = new Date(year, month - 1, day);
    } else {
      endDate = new Date(endDateStr);
    }

    if (isNaN(endDate.getTime())) return false;

    const currentDate = new Date();

    // Calculate the date that is 2 months (approximately 60 days) before the end date
    const twoMonthsBeforeEnd = new Date(endDate);
    twoMonthsBeforeEnd.setMonth(twoMonthsBeforeEnd.getMonth() - 2);

    // Check if current date is before the calculated date (at least 2 months before end date)
    return currentDate <= twoMonthsBeforeEnd;
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginHorizontal: 16,
        marginVertical: 8,
      }}
    >
      <LinearGradient
        colors={isDarkMode ? ["#1f2937", "#111827"] : ["#ffffff", "#f9fafb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-0.5"
        style={{
          shadowColor: isDarkMode ? "#000" : "#5c93bb",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View
          className={themedClasses(
            "bg-white rounded-2xl p-5",
            "bg-gray-800 rounded-2xl p-5"
          )}
        >
          {/* Status Badge - Top Right */}
          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: `${getStatusColor(item.status)}15`,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${getStatusColor(item.status)}30`,
              flexDirection: "row",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            {getStatusIcon(item.status)}
            <Text
              style={{
                color: getStatusColor(item.status),
                fontWeight: "600",
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              {t(`status.${item.status}`)}
            </Text>
          </View>

          {/* Property & Room Info */}
          <View className="mb-4 pr-28">
            <View className="flex-row items-center mb-1">
              <MaterialIcons
                name="home-work"
                size={18}
                color={isDarkMode ? "#9ca3af" : "#4b5563"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={themedClasses(
                  "text-lg font-bold text-gray-900",
                  "text-lg font-bold text-gray-100"
                )}
              >
                {item.name}
              </Text>
            </View>

            <View className="flex-row items-center">
              <FontAwesome5
                name="door-open"
                size={14}
                color={isDarkMode ? "#9ca3af" : "#4b5563"}
                style={{ marginRight: 8, marginLeft: 2 }}
              />
              <Text
                className={themedClasses(
                  "text-base font-medium text-gray-700",
                  "text-base font-medium text-gray-300"
                )}
              >
                {t("room")} {item.roomNumber}
              </Text>
            </View>
          </View>

          {/* Divider with gradient */}
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
            className="h-[1px] my-3"
          />

          {/* Deposit Details */}
          <View className="space-y-3 mb-4">
            {/* Amount */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <FontAwesome
                    name="money"
                    size={14}
                    color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
                >
                  {t("depositAmount")}
                </Text>
              </View>
              <Text
                className={themedClasses(
                  "font-bold text-gray-800",
                  "font-bold text-gray-100"
                )}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>

            {/* Rental Period */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={14}
                    color={isDarkMode ? "#4ade80" : "#22c55e"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
                >
                  {t("rentalPeriod")}
                </Text>
              </View>
              <Text
                className={themedClasses(
                  "font-semibold text-gray-800",
                  "font-semibold text-gray-100"
                )}
              >
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>

            {/* Rental Time */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                  }`}
                >
                  <MaterialIcons
                    name="timer"
                    size={14}
                    color={isDarkMode ? "#c084fc" : "#a855f7"}
                  />
                </View>
                <Text
                  className={themedClasses("text-gray-700", "text-gray-300")}
                >
                  {t("rentalTime")}
                </Text>
              </View>
              <Text
                className={themedClasses(
                  "font-semibold text-gray-800",
                  "font-semibold text-gray-100"
                )}
              >
                {item.rentalTime}{" "}
                {item.rentalTime === 1 ? t("month") : t("months")}
              </Text>
            </View>
          </View>

          {/* Actions */}
          {item.status === "confirmed" && (
            <>
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
                className="h-[1px] my-3"
              />

              <View className="flex-row justify-between mt-2">
                <TouchableOpacity
                  onPress={() => onPayRent(item)}
                  className={
                    shouldShowRefund(item.endDate) ? "flex-1 mr-2" : "flex-1"
                  }
                >
                  <LinearGradient
                    colors={
                      isDarkMode
                        ? ["#1d4ed8", "#2563eb"]
                        : ["#3b82f6", "#2563eb"]
                    }
                    className="px-4 py-3 rounded-xl flex-row items-center justify-center"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <FontAwesome
                      name="dollar"
                      size={14}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-medium">
                      {t("payRent")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {shouldShowRefund(item.endDate) && (
                  <TouchableOpacity
                    onPress={() => onRefund(item)}
                    className="flex-1 ml-2"
                  >
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["#991b1b", "#b91c1c"]
                          : ["#dc2626", "#b91c1c"]
                      }
                      className="px-4 py-3 rounded-xl flex-row items-center justify-center"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name="refresh"
                        size={16}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white font-medium">
                        {t("requestRefund")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

function MyDepositedRoom() {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation("myDepositedRoom");
  const { isLogin } = useCurrentUser();
  const router = useRouter();

  const { showSuccess, showError } = useNotification();

  const [depositData, setDepositData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 5,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Check login status
  useFocusEffect(
    useCallback(() => {
      if (!isLogin) {
        router.replace("/login");
        return;
      }
    }, [isLogin, router])
  );

  // Update the fetchData function to properly handle pagination
  const fetchData = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await getMyDepositedRoom({
          page: paginationOptions.page,
          limit: paginationOptions.limit,
        });

        if (res.success) {
          setPagination({
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalItems: res.pagination.totalItems,
            limit: res.pagination.limit,
            hasNextPage: res.pagination.hasNextPage,
            hasPrevPage: res.pagination.hasPrevPage,
          });

          // If loading more, append new data; otherwise, replace existing data
          if (isLoadMore) {
            setDepositData((prev) => [...prev, ...res.data]);
          } else {
            setDepositData(res.data);
          }
        } else {
          showError(t("fetchError"));
        }
      } catch (error) {
        console.error("Error fetching deposits:", error);
        showError(t("fetchError"));
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [paginationOptions, t, showError]
  );

  useEffect(() => {
    if (isLogin) {
      fetchData();
    }
  }, [fetchData, isLogin]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPaginationOptions((prev) => ({
      ...prev,
      page: 1,
      limit: 5,
    }));
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Action handlers
  const handlePayRent = useCallback((deposit) => {
    // Navigate to PayRent screen with deposit data
    router.push({
      pathname: "/mydepositedroom/payRent",
      params: { deposit: JSON.stringify(deposit) },
    });
  }, []);

  const handleRefund = useCallback(
    (deposit) => {
      console.log("Request refund for deposit:", deposit);
      showSuccess(t("refundRequestSent"));
    },
    [t, showSuccess]
  );

  // Update the handleLoadMore function
  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !loadingMore) {
      setPaginationOptions((prev) => ({
        ...prev,
        page: prev.page + 1, // Increment page instead of limit
      }));
      fetchData(true);
    }
  }, [pagination.hasNextPage, loadingMore, fetchData]);

  const hasMoreDeposits = depositData.length < pagination.totalItems;

  const renderDepositItem = useCallback(
    ({ item, index }) => (
      <DepositCard
        item={item}
        onPayRent={handlePayRent}
        onRefund={handleRefund}
        index={index}
      />
    ),
    [handlePayRent, handleRefund]
  );

  const renderFooter = () => {
    if (!loading || depositData.length > 0) return null;
    return (
      <View className="py-8">
        <View
          className={themedClasses(
            "bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl mx-4 p-6 shadow-xl",
            "bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/30"
          )}
        >
          <View className="flex-row items-center justify-center">
            <View className="animate-spin mr-4">
              <Ionicons
                name="refresh"
                size={24}
                color={isDarkMode ? "#3B82F6" : "#1D4ED8"}
              />
            </View>
            <Text
              className={themedClasses(
                "text-gray-700 text-lg font-semibold",
                "text-gray-300"
              )}
            >
              {t("loading")}...
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20 px-6">
      <View
        className={`p-12 rounded-3xl shadow-xl max-w-sm w-full ${themedClasses(
          "bg-white/95 backdrop-blur-sm border border-gray-200/50",
          "bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/40"
        )}`}
        style={{
          opacity: 1, // Instead of using Animated.FadeInDown
          transform: [{ translateY: 0 }], // Instead of using Animated.FadeInDown
        }}
      >
        <View className="items-center">
          {/* Enhanced empty state with animation */}
          <View className="relative mb-8">
            <LinearGradient
              colors={
                isDarkMode
                  ? ["rgba(139, 92, 246, 0.3)", "rgba(99, 102, 241, 0.1)"]
                  : ["rgba(139, 92, 246, 0.2)", "rgba(99, 102, 241, 0.05)"]
              }
              className="absolute -inset-5 rounded-full opacity-80 blur-xl"
            />
            <LinearGradient
              colors={
                isDarkMode ? ["#312e81", "#1e3a8a"] : ["#c7d2fe", "#e0e7ff"]
              }
              className="p-8 rounded-full relative shadow-lg"
            >
              <View>
                <MaterialCommunityIcons
                  name="home-city-outline"
                  size={72}
                  color={isDarkMode ? "#a5b4fc" : "#6366f1"}
                />
              </View>
            </LinearGradient>
          </View>

          <Text
            className={`text-2xl font-bold mb-4 text-center ${themedClasses(
              "text-gray-800",
              "text-gray-200"
            )}`}
          >
            {t("noDeposits")}
          </Text>
          <Text
            className={`text-center leading-6 text-base ${themedClasses(
              "text-gray-600",
              "text-gray-400"
            )}`}
          >
            {t("noDepositsSubtext")}
          </Text>

          {/* Add a browse homes button */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="flex-row items-center"
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#4338ca", "#3730a3"] : ["#6366f1", "#4f46e5"]
                }
                className="px-5 py-3 rounded-xl flex-row items-center"
              >
                <Ionicons
                  name="search"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-medium">
                  {t("browseHomes")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Enhanced LoadMoreButton
  const renderLoadMoreButton = () => {
    if (depositData.length === 0 || loading) return null;

    return (
      <LoadMoreButton
        hasMore={hasMoreDeposits}
        currentCount={depositData.length}
        totalCount={pagination.totalItems}
        itemsPerPage={5}
        isLoading={loadingMore}
        onLoadMore={handleLoadMore}
        itemName="deposits"
        translations={{
          allLoaded: t("allDepositsLoaded") || "All deposits loaded",
          loadingMore: t("loadingMoreDeposits") || "Loading more deposits...",
          loadMore: t("loadMoreDeposits") || "Load more deposits",
          progressText: `${depositData.length} ${t("of")} ${
            pagination.totalItems
          } ${t("depositsLoaded")}`,
        }}
        showProgress={true}
        customStyles={{
          container: { paddingHorizontal: 0, marginBottom: 24 },
          button: {
            marginHorizontal: 16,
          },
        }}
      />
    );
  };

  // Enhanced Header
  const renderHeader = () => (
    <View className="px-4 py-2 mb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="wallet-outline"
            size={20}
            color={isDarkMode ? "#a5b4fc" : "#4f46e5"}
            style={{ marginRight: 8 }}
          />
          <Text
            className={themedClasses(
              "text-gray-700 text-base font-medium",
              "text-gray-300 text-base font-medium"
            )}
          >
            {t("totalDeposits")}: {pagination.totalItems}
          </Text>
        </View>

        {depositData.length > 0 && (
          <View
            className="flex-row items-center py-1 px-3 rounded-full bg-opacity-20"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(79, 70, 229, 0.2)"
                : "rgba(79, 70, 229, 0.1)",
            }}
          >
            <MaterialCommunityIcons
              name="sort-variant"
              size={16}
              color={isDarkMode ? "#a5b4fc" : "#4f46e5"}
              style={{ marginRight: 4 }}
            />
            <Text
              className={themedClasses(
                "text-gray-700 text-sm",
                "text-gray-300 text-sm"
              )}
            >
              {t("recent")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (!isLogin) {
    return null;
  }

  return (
    <ScrollContainer>
      <BackHeader
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
        onBackPress={() => router.push("/account")}
        title={t("myDepositedRooms")}
        rightComponent={
          <MaterialCommunityIcons
            name="home-search"
            size={22}
            color={isDarkMode ? "#a5b4fc" : "#4f46e5"}
            style={{ marginRight: 4 }}
            onPress={() => router.push("/")}
          />
        }
      />

      <FlatList
        data={depositData}
        renderItem={renderDepositItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? "#3b82f6" : "#1d4ed8"]}
            tintColor={isDarkMode ? "#3b82f6" : "#1d4ed8"}
            progressBackgroundColor={isDarkMode ? "#1f2937" : "#ffffff"}
          />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 32,
          flexGrow: 1,
        }}
      />

      {renderLoadMoreButton()}
    </ScrollContainer>
  );
}

export default MyDepositedRoom;
