import React, { useState, useCallback, useRef } from "react";
import { BackHeader } from "@/components/navigation/CustomHeader";
import { getRenewalRequests } from "@/API/renewalRequestAPI";
import {
  Text,
  Loader,
  LoadMoreButton,
  EmptyState,
} from "@/components/ui";
import { ScreenContainer } from "@/components/layout";
import { useThemedClasses } from "@/utils/useTheme";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCurrentUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import RenewalCard from "@/components/screen/myRenewalRequest/RenewalCard";
import { FlatList, View, StyleSheet } from "react-native";

function MyRenewalRequest() {
  const { t } = useTranslation("myRenewalRequest");
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [renewalRequests, setRenewalRequests] = useState([]);
  const router = useRouter();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sử dụng ref để tránh vòng lặp vô hạn trong useFocusEffect
  const isInitialMount = useRef(true);

  const { isLogin } = useCurrentUser();

  // Fetch renewal request data
  const fetchRenewalRequests = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getRenewalRequests(pagination);


      if (isLoadMore) {
        // Nếu là load more, append data mới vào data cũ
        setRenewalRequests((prev) => [...prev, ...(response.data || [])]);
      } else {
        // Nếu là fetch mới, replace toàn bộ data
        setRenewalRequests(response.data || []);
      }

      setPagination({
        page: response.pagination.currentPage,
        limit: response.pagination.limit,
        totalItems: response.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error fetching renewal requests:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    const newPagination = {
      ...pagination,
      page: pagination.page + 1,
    };
    setPagination(newPagination);

    // Gọi API với pagination mới
    try {
      setLoadingMore(true);
      const response = await getRenewalRequests(newPagination);


      setRenewalRequests((prev) => [...prev, ...(response.data || [])]);
      setPagination({
        page: response.pagination.currentPage,
        limit: response.pagination.limit,
        totalItems: response.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error loading more renewal requests:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isLogin) {
        router.push("/login");
        return;
      }

      // Chỉ fetch data khi component mount lần đầu
      if (isInitialMount.current) {
        fetchRenewalRequests();
        isInitialMount.current = false;
      }
    }, [isLogin]) // Bỏ pagination khỏi dependency để tránh infinite loop
  );

  const hasMore = renewalRequests.length < pagination.totalItems;

  // Render item cho FlatList
  const renderRenewalItem = ({ item, index }) => (
    <RenewalCard
      key={index}
      count={index + 1}
      renewal={item}
      isDarkMode={isDarkMode}
      themedClasses={themedClasses}

    />
  );

  // Render empty component
  const renderEmptyComponent = () => {
    if (loading) {
      return <Loader />;
    }

    return (
      <EmptyState
        title={t("noRenewalRequests")}
        icon={<MaterialCommunityIcons name="calendar-refresh" size={50} color="#ccc" />}
        description={t("noRenewalRequestsDescription")}
      />
    );
  };

  // Render header component
  const renderHeaderComponent = () => (
    <BackHeader
      backIcon={
        <FontAwesome5
          name="chevron-left"
          size={18}
          color={isDarkMode ? "#fff" : "#333"}
        />
      }
      onBackPress={() => router.push("/account")}
      title={t("myRenewalRequests")}
    />
  );

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={renewalRequests}
        renderItem={renderRenewalItem}
        keyExtractor={(item, index) => `renewal-${index}`}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          renewalRequests.length === 0 && styles.emptyContainer,
        ]}
        // Pull to refresh
        refreshing={loading}
        onRefresh={() => {
          setPagination({ page: 1, limit: 5, totalItems: 0 });
          fetchRenewalRequests(false);
        }}
      />

      {/* Footer Load More Button */}
      {!loading && renewalRequests.length > 0 && hasMore && (
        <View style={styles.footerContainer}>
          <LoadMoreButton
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={loadingMore}
            itemsPerPage={5}
            currentCount={renewalRequests.length}
            totalCount={pagination.totalItems}
            itemName={t("renewalRequests")}
          />
        </View>
      )}
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});

export default MyRenewalRequest;
