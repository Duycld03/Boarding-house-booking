import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Alert, RefreshControl, FlatList } from 'react-native';
import { ScrollContainer } from '@/components/layout';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import {
  getAppointmentOfUser,
  updateAppointmentStatus,
} from '@/API/appointment';

import { useNotification } from '@/context/NotificationProvider'

function MyAppointment() {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('myAppointment');
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotification()

  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const statusColors = {
    pending: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
    accepted: isDarkMode ? 'bg-orange-600' : 'bg-orange-500',
    canceled: isDarkMode ? 'bg-red-600' : 'bg-red-500',
    completed: isDarkMode ? 'bg-green-600' : 'bg-green-500',
  };

  const statusTextColors = {
    pending: 'text-white',
    accepted: 'text-white',
    canceled: 'text-white',
    completed: 'text-white',
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentOfUser(paginationOptions);
      setPagination({
        currentPage: res.currentPage,
        totalPages: res.totalPages,
        totalItems: res.pagination.totalItems,
        limit: res.limit,
      });

      if (res.data.length === 0) {
        showInfo(t('noDataAvailable'));
      } else {
        setAppointmentData(res.data);
      }
    } catch (error) {
      console.log(error);
      showError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [paginationOptions, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleCancel = useCallback((appointment) => {
    Alert.alert(
      t('confirmCancellation'),
      t('confirmCancellationMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await updateAppointmentStatus(appointment._id, {
                status: 'canceled',
              });

              if (res) {
                await fetchData();
                showSuccess(t('appointmentCanceled'));
              } else {
                showError(t('cancelError'));
              }
            } catch (error) {
              showError(`${t('cancelFailed')}: ${error.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [fetchData, t]);

  const loadMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      setPaginationOptions(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [pagination.currentPage, pagination.totalPages, loading]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAppointmentItem = ({ item }) => (
    <View
      className={themedClasses(
        'bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm',
        'bg-gray-800 border-gray-700'
      )}
    >
      {/* Status Badge */}
      <View className="flex-row justify-between items-start mb-3">
        <View
          className={`${statusColors[item.status]} px-3 py-1 rounded-full`}
        >
          <Text className={`${statusTextColors[item.status]} text-xs font-medium capitalize`}>
            {t(`status.${item.status}`)}
          </Text>
        </View>
        <Text className={themedClasses('text-gray-500 text-xs', 'text-gray-400')}>
          {formatDate(item.appointmentDate)}
        </Text>
      </View>

      {/* Appointment Details */}
      <View className="space-y-2">
        <View>
          <Text className={themedClasses('text-gray-600 text-xs', 'text-gray-400')}>
            {t('owner')}
          </Text>
          <Text className={themedClasses('text-gray-900 font-medium', 'text-white')}>
            {item.ownerName}
          </Text>
        </View>

        <View>
          <Text className={themedClasses('text-gray-600 text-xs', 'text-gray-400')}>
            {t('boardingHouse')}
          </Text>
          <Text className={themedClasses('text-gray-900 font-medium', 'text-white')}>
            {item.boardingHouseName}
          </Text>
        </View>

        <View>
          <Text className={themedClasses('text-gray-600 text-xs', 'text-gray-400')}>
            {t('roomNumber')}
          </Text>
          <Text className={themedClasses('text-gray-900 font-medium', 'text-white')}>
            {item.roomNumber}
          </Text>
        </View>

        {item.note && (
          <View>
            <Text className={themedClasses('text-gray-600 text-xs', 'text-gray-400')}>
              {t('note')}
            </Text>
            <Text className={themedClasses('text-gray-900', 'text-white')} numberOfLines={3}>
              {item.note}
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      {item.status !== 'canceled' && item.status !== 'completed' && (
        <View className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => handleCancel(item)}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              {t('cancelAppointment')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <Text className={themedClasses('text-gray-500 text-center', 'text-gray-400')}>
          {t('loading')}...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className={themedClasses('text-gray-500 text-lg', 'text-gray-400')}>
        {t('noAppointments')}
      </Text>
      <Text className={themedClasses('text-gray-400 text-sm mt-2', 'text-gray-500')}>
        {t('noAppointmentsSubtext')}
      </Text>
    </View>
  );

  return (
    <ScrollContainer>
      <BackHeader title={t('myAppointments')} />

      <View className="flex-1 px-4">
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
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
        />
      </View>
    </ScrollContainer>
  );
}

export default MyAppointment;