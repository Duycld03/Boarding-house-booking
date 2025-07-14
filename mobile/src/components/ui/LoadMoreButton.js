import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import Text from './Text';

/**
 * LoadMoreButton Component
 *
 * @param {Object} props
 * @param {boolean} props.hasMore - Có còn dữ liệu để load không
 * @param {number} props.currentCount - Số lượng item hiện tại
 * @param {number} props.totalCount - Tổng số item
 * @param {number} props.itemsPerPage - Số item mỗi lần load
 * @param {boolean} props.isLoading - Trạng thái đang loading
 * @param {Function} props.onLoadMore - Callback khi nhấn load more
 * @param {string} props.itemName - Tên của item (reviews, appointments, etc.)
 * @param {Object} props.translations - Object chứa các key translation tùy chỉnh
 * @param {boolean} props.showProgress - Hiển thị progress bar hay không (default: true)
 * @param {Object} props.customStyles - Custom styles cho component
 */
const LoadMoreButton = ({
  hasMore,
  currentCount,
  totalCount,
  itemsPerPage,
  isLoading = false,
  onLoadMore,
  itemName = 'items',
  translations = {},
  showProgress = true,
  customStyles = {},
}) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('common');

  // Default translations với fallback
  const defaultTranslations = {
    allLoaded: t('loaderComponent.allLoaded', { itemName }),
    loadingMore: t('loaderComponent.loadingMore', { itemName }),
    loadMore: t('loaderComponent.loadMore', { itemName }),
    progressText: t('loaderComponent.progressText', { currentCount, totalCount, itemName }),
    ...translations,
  };

  // Nếu không còn dữ liệu để load
  if (!hasMore) {
    return (
      <View className="py-6 flex-row items-center justify-center">
        <FontAwesome
          name="check-circle"
          size={20}
          color="#10B981"
          style={{ marginRight: 6 }}
        />
        <Text
          className="text-base font-medium"
          style={{ color: '#10B981', ...customStyles.completedText }}
        >
          {defaultTranslations.allLoaded}
        </Text>
      </View>
    );
  }

  // Tính số items còn lại và số items sẽ load
  const remainingItems = totalCount - currentCount;
  const itemsToLoad = Math.min(itemsPerPage, remainingItems);

  return (
    <View className="py-6 px-4" style={customStyles.container}>
      <TouchableOpacity
        onPress={onLoadMore}
        disabled={isLoading}
        className={`flex-row items-center justify-center py-4 px-6 rounded-lg border-2 border-dashed ${isLoading
          ? `${themedClasses.border} opacity-50`
          : `border-blue-300 ${isDarkMode ? 'border-blue-600' : 'border-blue-300'
          }`
          }`}
        style={{
          backgroundColor: isDarkMode
            ? 'rgba(59, 130, 246, 0.1)'
            : 'rgba(59, 130, 246, 0.05)',
          ...customStyles.button,
        }}
      >
        {isLoading ? (
          <>
            {/* Loading animation */}
            <View className="flex-row items-center mr-3">
              <View
                className={`w-2 h-2 rounded-full mr-1 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                style={{ opacity: 0.4 }}
              />
              <View
                className={`w-2 h-2 rounded-full mr-1 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                style={{ opacity: 0.6 }}
              />
              <View
                className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                style={{ opacity: 0.8 }}
              />
            </View>
            <Text
              className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              style={customStyles.loadingText}
            >
              {defaultTranslations.loadingMore}
            </Text>
          </>
        ) : (
          <>
            <FontAwesome
              name="plus-circle"
              size={18}
              color={isDarkMode ? '#60A5FA' : '#3B82F6'}
              style={{ marginRight: 8 }}
            />
            <Text
              className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              style={customStyles.buttonText}
            >


              {defaultTranslations.loadMore ||
                `Load ${itemsToLoad} more ${itemName}`}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Progress indicator */}
      {showProgress && (
        <View
          className="mt-4 items-center"
          style={customStyles.progressContainer}
        >
          <Text
            className={`text-xs ${themedClasses.textSecondary} mb-2`}
            style={customStyles.progressText}
          >
            {defaultTranslations.progressText}
          </Text>
          <View
            className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            style={customStyles.progressTrack}
          >
            <View
              className="h-1 rounded-full bg-blue-500"
              style={{
                width: `${totalCount > 0 ? (currentCount / totalCount) * 100 : 0
                  }%`,
                ...customStyles.progressBar,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default LoadMoreButton;
