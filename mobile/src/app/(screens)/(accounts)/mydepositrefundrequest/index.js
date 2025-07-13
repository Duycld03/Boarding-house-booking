import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useNotification } from '@/context/NotificationProvider';
import { useCurrentUser } from '@/context/userContext';
import { getRefundRequests } from '@/API/refundRequestAPI';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { Text } from '@/components/ui';
import { ScrollContainer } from '@/components/layout';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import formatAmount from '@/utils/formatAmount';
import i18next from 'i18next';

function MyDepositRefundRequest() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { showError } = useNotification();
  const { isLogin } = useCurrentUser();
  const { t } = useTranslation('refundRequest');
  const currentLanguage = i18next.language;

  const [refundData, setRefundData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalItems: 0,
    limit: 5,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isLogin) {
        router.replace('/login');
      }
    }, [isLogin])
  );

  const fetchData = useCallback(
    async ({ page, limit }, isLoadMore = false) => {
      if (!isLogin) return;

      isLoadMore ? setLoadingMore(true) : setLoading(true);

      try {
        const res = await getRefundRequests({ page, limit });
        const newItems = res?.data || [];
        const totalItems = res?.pagination?.totalItems || 0;

        setRefundData((prev) =>
          isLoadMore
            ? [
                ...prev,
                ...newItems.filter(
                  (item) => !prev.some((r) => r._id === item._id)
                ),
              ]
            : newItems
        );

        setPagination({
          page,
          limit,
          totalItems,
          hasNextPage: page * limit < totalItems,
        });
      } catch (error) {
        router.replace('/login');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [isLogin, showError, router, t]
  );

  useEffect(() => {
    fetchData({ page: 1, limit: 5 });
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefundData([]);
    fetchData({ page: 1, limit: 5 });
  }, [fetchData]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !loading && !loadingMore) {
      fetchData({ page: pagination.page + 1, limit: pagination.limit }, true);
    }
  }, [pagination, loading, loadingMore, fetchData]);

  const hasMore = useMemo(
    () => refundData.length < pagination.totalItems,
    [refundData, pagination.totalItems]
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20 px-6">
      <View
        className={`p-12 rounded-3xl shadow-xl max-w-sm w-full ${themedClasses(
          'bg-white/95 backdrop-blur-sm border border-gray-200/50',
          'bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/40'
        )}`}
      >
        <MaterialCommunityIcons
          name="cash-refund"
          size={64}
          color={isDarkMode ? '#8B5CF6' : '#6366F1'}
          style={{ marginBottom: 16, alignSelf: 'center' }}
        />
        <Text
          className={`text-xl font-bold text-center ${themedClasses(
            'text-gray-700',
            'text-gray-300'
          )}`}
        >
          {t('refund.emptyTitle')}
        </Text>
        <Text
          className={`text-center text-base mt-2 ${themedClasses(
            'text-gray-500',
            'text-gray-400'
          )}`}
        >
          {t('refund.emptyMessage')}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollContainer>
      <BackHeader
        title={t('refund.pageTitle')}
        onBackPress={() => router.back()}
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? '#fff' : '#333'}
          />
        }
      />

      <FlatList
        data={refundData}
        renderItem={({ item, index }) => (
          <RefundCard
            item={item}
            index={index}
            t={t}
            isDarkMode={isDarkMode}
            currentLanguage={currentLanguage}
          />
        )}
        keyExtractor={(item, index) => item._id || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#3b82f6' : '#1d4ed8']}
            tintColor={isDarkMode ? '#3b82f6' : '#1d4ed8'}
          />
        }
        ListEmptyComponent={!loading && renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 32,
          flexGrow: 1,
        }}
      />

      <LoadMoreButton
        hasMore={hasMore}
        currentCount={refundData.length}
        totalCount={pagination.totalItems}
        itemsPerPage={pagination.limit}
        isLoading={loadingMore}
        onLoadMore={handleLoadMore}
        itemName="refunds"
        translations={{
          allLoaded: t('refund.loadAll'),
          loadingMore: t('refund.loadingMore'),
          loadMore: t('refund.loadMore'),
          progressText: `${refundData.length} / ${pagination.totalItems} ${t(
            'refund.requests'
          )}`,
        }}
        showProgress
      />
    </ScrollContainer>
  );
}

const RefundCard = ({ item, index, t, isDarkMode, currentLanguage }) => {
  const statusMap = {
    pending: { color: '#f59e0b', label: t('refund.status.pending') },
    accepted: { color: '#10b981', label: t('refund.status.accepted') },
    rejected: { color: '#ef4444', label: t('refund.status.rejected') },
  };

  const status = statusMap[item.status] || {
    color: 'white',
    label: item.status,
  };
  const truncateText = (text, maxLength = 10) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <View className="mb-4 px-4">
      <View
        className={`rounded-xl p-4 shadow-md border relative ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        {/* Tag trạng thái góc phải */}
        <View
          className="absolute top-2 right-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: status.color }}
        >
          <Text className="text-[10px] font-semibold text-white">
            {status.label}
          </Text>
        </View>

        {/* Tiêu đề */}
        <View className="flex-row items-center max-w-[95%]">
          <Text
            className="text-lg font-semibold text-gray-800 dark:text-white"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            #{index + 1} {t('refund.room')} {item.roomNumber} -{' '}
            {truncateText(item.boardingHouseName, 15)}
          </Text>
        </View>

        {/* Thông tin chi tiết */}
        <RefundItemRow
          icon="calendar-end"
          label={t('refund.endDate')}
          value={item.endDate}
        />
        <RefundItemRow
          icon="cash"
          label={t('refund.amount')}
          value={formatAmount(item.amountRefunded, currentLanguage)}
          color="#22c55e"
        />
        {/* <RefundItemRow
          icon="clipboard-check-outline"
          label={t('refund.status.label')}
          value={status.label}
          color={status.color}
        /> */}
        <RefundItemRow
          icon="comment-text-outline"
          label={t('refund.reason')}
          value={item.reason || t('refund.noReason')}
          color="#3b82f6"
        />
        <RefundItemRow
          icon="clock-outline"
          label={t('refund.createdAt')}
          value={item.createdAt}
          color="#6366f1"
        />
      </View>
    </View>
  );
};

const RefundItemRow = ({ icon, label, value, color = '#6b7280' }) => (
  <View className="flex-row items-center mb-1">
    <MaterialCommunityIcons
      name={icon}
      size={16}
      color={color}
      style={{ marginRight: 6 }}
    />
    <Text className="text-gray-700 dark:text-gray-300">
      <Text className="font-semibold">{label}: </Text>
      {value}
    </Text>
  </View>
);

export default MyDepositRefundRequest;
