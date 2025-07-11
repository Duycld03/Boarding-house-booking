import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { getMyRefundRequests } from "@/API/refundRequestAPI";
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

  // State management
  const [depositData, setDepositData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refundRequestsMap, setRefundRequestsMap] = useState({});
  const [loadingRefundRequests, setLoadingRefundRequests] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
    hasNextPage: false,
    hasPrevPage: false,
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

  // Fetch refund requests map
  const fetchRefundRequests = useCallback(async () => {
    setLoadingRefundRequests(true);
    try {
      const response = await getMyRefundRequests();
      setRefundRequestsMap(response.refundRequests || {});
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      setRefundRequestsMap({});
    } finally {
      setLoadingRefundRequests(false);
    }
  }, []);

  // Fetch data function with proper pagination handling
  const fetchData = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await getMyDepositedRoom(paginationOptions);

        if (res.success) {
          // Update pagination state
          setPagination({
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalItems: res.pagination.totalItems,
            limit: res.pagination.limit,
            hasNextPage: res.pagination.hasNextPage,
            hasPrevPage: res.pagination.hasPrevPage,
          });

          // Handle data based on load more or initial load
          if (isLoadMore) {
            setDepositData((prev) => {
              // Create a Set of existing IDs to prevent duplicates
              const existingIds = new Set(prev.map((item) => item._id));

              // Filter out any items that already exist
              const newUniqueItems = res.data.filter(
                (item) => !existingIds.has(item._id)
              );

              return [...prev, ...newUniqueItems];
            });
          } else {
            setDepositData(res.data);
          }

          // Fetch refund requests after getting deposit data
          await fetchRefundRequests();
        } else {
          showError(res.message || t("errorLoadingDeposits"));
        }
      } catch (error) {
        console.error("Error fetching deposit data:", error);
        showError(
          error.response?.data?.message ||
            error.message ||
            t("errorLoadingDeposits")
        );
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [paginationOptions, t, showError, fetchRefundRequests]
  );

  // Initial load effect
  useEffect(() => {
    if (isLogin && paginationOptions.page === 1) {
      fetchData();
    }
  }, [isLogin]); // Don't include fetchData to prevent infinite loop

  // Load more effect
  useEffect(() => {
    if (paginationOptions.page > 1) {
      fetchData(true);
    }
  }, [paginationOptions.page]); // Don't include fetchData to prevent infinite loop

  // THÊM MỚI: useFocusEffect để refresh refund requests khi screen được focus
  useFocusEffect(
    useCallback(() => {
      // Chỉ refresh refund requests, không fetch lại toàn bộ data
      if (isLogin && depositData.length > 0) {
        fetchRefundRequests();
      }
    }, [isLogin, depositData.length, fetchRefundRequests])
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Reset pagination to page 1
    setPaginationOptions({
      page: 1,
      limit: 5,
      sortField: "createdAt",
      sortOrder: "desc",
    });

    // Clear existing data
    setDepositData([]);
    setRefundRequestsMap({});

    try {
      const res = await getMyDepositedRoom({
        page: 1,
        limit: 5,
        sortField: "createdAt",
        sortOrder: "desc",
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

        setDepositData(res.data);
        // Fetch refund requests after setting data
        await fetchRefundRequests();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showError(t("errorLoadingDeposits"));
    } finally {
      setRefreshing(false);
    }
  }, [showError, t, fetchRefundRequests]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    // Check if we can load more
    if (pagination.hasNextPage && !loadingMore && !loading) {
      setPaginationOptions((prev) => ({
        ...prev,
        page: prev.page + 1, // Increment page to get next 5 items
      }));
    }
  }, [
    pagination.hasNextPage,
    loadingMore,
    loading,
    paginationOptions.page,
    depositData.length,
    pagination.totalItems,
  ]);

  // Calculate if we should show load more button
  const hasMoreDeposits = useMemo(() => {
    return depositData.length < pagination.totalItems && pagination.hasNextPage;
  }, [depositData.length, pagination.totalItems, pagination.hasNextPage]);

  // Handle refund
  const handleRefund = useCallback(
    (deposit) => {
      const hasExistingRequest = refundRequestsMap[deposit._id];

      if (hasExistingRequest) {
        showError(t("refundRequestAlreadyExists"));
        return;
      }

      // Navigate to refund screen
      router.push({
        pathname: "/mydepositedroom/refundRequest",
        params: { depositId: deposit._id },
      });
    },
    [router, refundRequestsMap, showError, t]
  );

  // Handle pay deposit
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

  // Render functions
  const renderDepositItem = useCallback(
    ({ item, index }) => (
      <DepositCard
        item={item}
        onRefund={handleRefund}
        onPayDeposit={handlePayDeposit}
        index={index}
        hasExistingRefundRequest={!!refundRequestsMap[item._id]} // Pass refund request status
        refundRequestInfo={refundRequestsMap[item._id]} // Pass refund request info
      />
    ),
    [handleRefund, handlePayDeposit, refundRequestsMap]
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
            borderRadius: 24,
            overflow: "hidden",
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
          opacity: 1,
          transform: [{ translateY: 0 }],
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <View className="items-center">
          <View className="relative mb-8">
            <LinearGradient
              colors={
                isDarkMode
                  ? ["rgba(139, 92, 246, 0.3)", "rgba(99, 102, 241, 0.1)"]
                  : ["rgba(139, 92, 246, 0.2)", "rgba(99, 102, 241, 0.05)"]
              }
              className="absolute -inset-5 rounded-full opacity-80 blur-xl"
              style={{ borderRadius: 9999 }}
            />
            <MaterialCommunityIcons
              name="home-search"
              size={80}
              color={isDarkMode ? "#8B5CF6" : "#6366F1"}
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
            borderRadius: 12,
          },
        }}
      />
    );
  };

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
        keyExtractor={(item, index) => item._id || `deposit-${index}`}
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
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10}
      />

      {renderLoadMoreButton()}
    </ScrollContainer>
  );
}

export default MyDepositedRoom;
