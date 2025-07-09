import { BackHeader } from "@/components/navigation/CustomHeader";
import { getRentPaymentByUserId } from "@/API/rentPaymentAPI";
import {
  Text,
  Button,
  Loader,
  LoadMoreButton,
  EmptyState,
} from "@/components/ui";
import { ScreenContainer } from "@/components/layout";
import { useThemedClasses } from "@/utils/useTheme";
import { FontAwesome5 } from "@expo/vector-icons";

import { useCurrentUser } from "@/context/userContext";

import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useRef } from "react";

import UserPaymentCard from "@/components/screen/myRentPayment/userPaymentCard";
import { FlatList, View, StyleSheet } from "react-native";

function MyRentPayment() {
  const { t } = useTranslation("myRentPayment");
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [userPayment, setUserPayment] = useState([]);
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

  // Fetch user payment data
  const fetchUserPayment = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const paymentData = await getRentPaymentByUserId(pagination);

      if (isLoadMore) {
        // Nếu là load more, append data mới vào data cũ
        setUserPayment((prev) => [...prev, ...(paymentData.data || [])]);
      } else {
        // Nếu là fetch mới, replace toàn bộ data
        setUserPayment(paymentData.data || []);
      }

      setPagination({
        page: paymentData.pagination.page,
        limit: paymentData.pagination.limit,
        totalItems: paymentData.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error fetching user payment data:", error);
      // Có thể thêm error handling ở đây (toast, alert, etc.)
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
      const paymentData = await getRentPaymentByUserId(newPagination);
      setUserPayment((prev) => [...prev, ...(paymentData.data || [])]);
      setPagination({
        page: paymentData.pagination.page,
        limit: paymentData.pagination.limit,
        totalItems: paymentData.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error loading more payments:", error);
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
        fetchUserPayment();
        isInitialMount.current = false;
      }
    }, [isLogin]) // Bỏ pagination khỏi dependency để tránh infinite loop
  );

  const hasMore = userPayment.length < pagination.totalItems;

  // Render item cho FlatList
  const renderPaymentItem = ({ item, index }) => (
    <UserPaymentCard
      key={index}
      count={index + 1}
      payment={item}
      isDarkMode={isDarkMode}
      themedClasses={themedClasses}
      onPressDetails={(payment) => {
        router.push({
          pathname: "/myrentpayment/paymentDetail",
          params: { paymentData: JSON.stringify(payment) },
        });
      }}
      onPressPay={(payment) => {
        router.push({
          pathname: "/myrentpayment/payRent",
          params: { paymentBillId: payment.paymentBillId._id },
        });
      }}
    />
  );

  // Render empty component
  const renderEmptyComponent = () => {
    if (loading) {
      return <Loader />;
    }

    return (
      <EmptyState
        title={t("noPayments")}
        icon={<FontAwesome5 name="money-bill-wave" size={50} color="#ccc" />}
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
      title={t("myRentPayments")}
    />
  );

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={userPayment}
        renderItem={renderPaymentItem}
        keyExtractor={(item, index) => `payment-${index}`}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          userPayment.length === 0 && styles.emptyContainer,
        ]}
        // Pull to refresh (optional)
        refreshing={loading}
        onRefresh={() => {
          setPagination({ page: 1, limit: 5, totalItems: 0 });
          fetchUserPayment(false);
        }}
      />

      {/* Footer Load More Button */}
      {!loading && userPayment.length > 0 && hasMore && (
        <View style={styles.footerContainer}>
          <LoadMoreButton
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={loadingMore}
            itemsPerPage={5}
            currentCount={userPayment.length}
            totalCount={pagination.totalItems}
            itemName={t("rentPayments")}
          />
        </View>
      )}
    </ScreenContainer>
  );
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

export default MyRentPayment;
