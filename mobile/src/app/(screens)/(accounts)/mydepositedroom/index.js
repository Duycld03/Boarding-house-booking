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
import DepositCard from "@/components/screen/myDepositedRoom/DepositCard";

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
  const handlePayRent = useCallback(
    (deposit) => {
      // Navigate to PayRent screen with deposit data
      router.push({
        pathname: "/mydepositedroom/payRent",
        params: { deposit: JSON.stringify(deposit) },
      });
    },
    [router]
  );

  const handleRefund = useCallback(
    (deposit) => {
      showSuccess(t("refundRequestSent"));
    },
    [t, showSuccess]
  );

  // Add to your MyDepositedRoom screen
  const handlePayDeposit = useCallback(
    (item) => {
      // Navigate to pay deposit screen with deposit data
      router.push({
        pathname: "/mydepositedroom/payDeposit",
        params: { deposit: JSON.stringify(item) },
      });
    },
    [router]
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
        onPayDeposit={handlePayDeposit} // Add this prop
        index={index}
      />
    ),
    [handlePayRent, handleRefund, handlePayDeposit]
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
          style={{
            borderRadius: 24, // Explicitly set borderRadius to match rounded-3xl
            overflow: "hidden", // Ensure content doesn't overflow rounded corners
          }}
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
          borderRadius: 24, // Explicitly set borderRadius to match rounded-3xl
          overflow: "hidden", // Ensure content doesn't overflow rounded corners
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
              style={{ borderRadius: 9999 }} // Ensure the gradient blob is properly rounded
            />
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
            borderRadius: 12, // Ensure consistent border radius on load more button
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
