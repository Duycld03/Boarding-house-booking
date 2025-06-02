import React, { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, FlatList } from 'react-native';
import { ScrollContainer } from '@/components/layout';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { ConfirmModal } from '@/components/feedback'
import { Text, Loader } from '@/components/ui';
import LoadMoreButton from '@/components/ui/LoadMoreButton'; // Import LoadMoreButton
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import {
  getAppointmentOfUser,
  updateAppointmentStatus,
} from '@/API/appointment';
import { useNotification } from '@/context/NotificationProvider';
import {
  Ionicons,
  MaterialIcons,
  AntDesign,
  FontAwesome,
  FontAwesome5,
} from '@expo/vector-icons';
import { AppointmentCard } from '@/components/screen/myAppointment';
import { useCurrentUser } from '@/context/userContext'
import { useFocusEffect, useRouter } from 'expo-router';

function MyAppointment() {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('myAppointment');
  const { isLogin } = useCurrentUser()
  const router = useRouter()

  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotification();

  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // State cho load more

  // State cho ConfirmModal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 5,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  // Check login status using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      if (!isLogin) {
        router.replace('/login'); // or router.push('/login') depending on your routing structure
        return;
      }
    }, [isLogin, router])
  );

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getAppointmentOfUser(paginationOptions);

      setPagination({
        currentPage: res?.pagination?.currentPage,
        totalPages: res.pagination?.totalPages,
        totalItems: res.pagination.totalItems,
        limit: res.pagination?.limit,
      });

      if (isLoadMore) {
        // Append new data to existing data
        setAppointmentData(prev => [...prev, ...res.data]);
      } else {
        // Replace data (for initial load or refresh)

        setAppointmentData(res.data);
      }
    } catch (error) {
      console.log(error);
      showError(t('fetchError'));
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [paginationOptions, t]);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (isLogin) {
      fetchData();
    }
  }, [fetchData, isLogin]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reset pagination for refresh
    setPaginationOptions(prev => ({ ...prev, page: 1 }));
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Mở ConfirmModal
  const handleShowCancelConfirm = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setConfirmModalVisible(true);
  }, []);

  // Đóng ConfirmModal
  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalVisible(false);
    setSelectedAppointment(null);
  }, []);

  // Xử lý xác nhận hủy lịch hẹn
  const handleConfirmCancel = useCallback(async () => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const res = await updateAppointmentStatus(selectedAppointment._id, {
        status: 'canceled',
      });



      if (res) {
        // Refresh data after canceling
        setPaginationOptions(prev => ({ ...prev, page: 1 }));
        await fetchData();
        showSuccess(t('appointmentCanceled'));
        handleCloseConfirmModal();
      } else {
        showError(t('cancelError'));
      }
    } catch (error) {
      showError(`${t('cancelFailed')}: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAppointment, fetchData, t, handleCloseConfirmModal]);

  // Function cũ - giờ sẽ gọi handleShowCancelConfirm thay vì Alert
  const handleCancel = useCallback((appointment) => {
    handleShowCancelConfirm(appointment);
  }, [handleShowCancelConfirm]);

  // Handle load more với LoadMoreButton
  const handleLoadMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !loadingMore) {
      setPaginationOptions(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
      fetchData(true); // Pass true để indicate load more
    }
  }, [pagination.currentPage, pagination.totalPages, loadingMore, fetchData]);



  // Check if has more data
  const hasMoreAppointments = pagination.currentPage < pagination.totalPages;

  const renderAppointmentItem = useCallback(({ item }) => (
    <AppointmentCard
      item={item}
      onCancel={handleCancel}
    />
  ), [handleCancel]);


  // Simplified render footer - chỉ hiển thị khi initial loading
  const renderFooter = () => {
    if (!loading || appointmentData.length > 0) return null;
    return (
      <View className="py-8">
        <View className={themedClasses(
          'bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl mx-4 p-6 shadow-xl',
          'bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/30'
        )}>
          <View className="flex-row items-center justify-center">
            <View className="animate-spin mr-4">
              <Ionicons
                name="refresh"
                size={24}
                color={isDarkMode ? '#3B82F6' : '#1D4ED8'}
              />
            </View>
            <Text className={themedClasses('text-gray-700 text-lg font-semibold', 'text-gray-300')}>
              {t('loading')}...
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20 px-6">
      <View className={themedClasses(
        'bg-white/95 backdrop-blur-sm border border-gray-200/50 p-12 rounded-3xl shadow-xl max-w-sm w-full',
        'bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/40'
      )}>
        <View className="items-center">
          {/* Empty state icon with enhanced styling */}
          <View className="relative mb-8">
            <View className="absolute -inset-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 blur-xl" />
            <View className={themedClasses(
              'bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-full relative shadow-lg',
              'bg-gradient-to-br from-blue-900/40 to-purple-900/40 shadow-xl'
            )}>
              <Ionicons
                name="calendar-outline"
                size={72}
                color={isDarkMode ? '#8B5CF6' : '#6366F1'}
              />
            </View>
          </View>

          <Text className={themedClasses('text-gray-800 text-2xl font-bold mb-4 text-center', 'text-gray-200')}>
            {t('noAppointments')}
          </Text>
          <Text className={themedClasses('text-gray-600 text-center leading-6 text-base', 'text-gray-400')}>
            {t('noAppointmentsSubtext')}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render LoadMoreButton
  const renderLoadMoreButton = () => {
    // Chỉ hiển thị khi có data và không phải initial loading
    if (appointmentData.length === 0 || loading) return null;

    return (
      <LoadMoreButton
        hasMore={hasMoreAppointments}
        currentCount={appointmentData.length}
        totalCount={pagination.totalItems}
        itemsPerPage={pagination.limit}
        isLoading={loadingMore}
        onLoadMore={handleLoadMore}
        itemName="appointments"
        translations={{
          allLoaded: t('allAppointmentsLoaded') || 'All appointments loaded',
          loadingMore: t('loadingMoreAppointments') || 'Loading more appointments...',
          loadMore: t('loadMoreAppointments') || 'Load more appointments',
          progressText: `${appointmentData.length} ${t('of')} ${pagination.totalItems} ${t('appointmentsLoaded')}`
        }}
        showProgress={true}
        customStyles={{
          container: { paddingHorizontal: 0 }, // Remove extra padding
          button: {
            marginHorizontal: 16,
          }
        }}
      />
    );
  };

  // Don't render the component if user is not logged in
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
            color={isDarkMode ? '#fff' : '#333'}
          />
        }
        title={t('myAppointments')}
      />

      <FlatList
        data={appointmentData}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#3b82f6' : '#1d4ed8']}
            tintColor={isDarkMode ? '#3b82f6' : '#1d4ed8'}
            progressBackgroundColor={isDarkMode ? '#1f2937' : '#ffffff'}
          />
        }
        // Remove onEndReached since we're using LoadMoreButton
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View className="h-1" />}
      />

      {/* LoadMoreButton - hiển thị sau FlatList */}
      {renderLoadMoreButton()}

      {/* ConfirmModal */}
      <ConfirmModal
        visible={confirmModalVisible}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmCancel}
        title={t('confirmCancellation')}
        message={t('confirmCancellationMessage')}
        confirmText={t('confirm')}
        cancelText={t('cancel')}
        warningMode={true}
      // loading={isProcessing}
      />
    </ScrollContainer>
  );
}

export default MyAppointment;