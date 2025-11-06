import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AntDesign } from '@expo/vector-icons';
import getLocalizedAddress from '@/utils/addressHelper';

// Components
import { ScreenContainer } from '@/components/layout';
import {
  Text,
  BoardingHouseGallery,
  Loader,
  Line,
  Button,
} from '@/components/ui';
import { BackHeader } from '@/components/navigation/CustomHeader';
import {
  OwnerInfo,
  Description,
  RoomTypeCard,
  ReviewList,
} from '@/components/screen/bhDetail';
import ExtraPrices from '@/components/screen/bhDetail/ExtraPrices';

// Context & Utils
import { useTheme } from '@/context/ThemeProvider';
import formatAmount from '@/utils/formatAmount';
import emitter from '@/utils/FavoriteEvent';
import { useCurrentUser } from '@/context/userContext';

// API
import {
  getBoardingHouseDetail,
  getReviewByBhId,
  getRoomTypeByBhId,
} from '@/API/ownerUser/boardingHouse';
import { useThemedClasses } from '@/utils/useTheme';
import { addFavorite, getFavorite } from '@/API/favoriteAPI';
import i18next from 'i18next';
import coverBhType from '@/utils/coverBhType';
import ConfirmModal from '@/components/feedback/ConfirmModal';

// Constants
const DEFAULT_BOARDING_HOUSE_ID = '64ab1cd234abcd1234567878';
const SCROLL_OFFSET = 80;
const SCROLL_READY_DELAY = 500;
const SCROLL_TO_ROOM_DELAY = 300;

export default function BhDetailScreen() {
  // Hooks
  const { t } = useTranslation('boardingHouseDetail');
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const currentLanguage = i18next.language;
  const [reviews, setReviews] = useState([]);

  const { themedClasses } = useThemedClasses();
  const { contextLogout, isLogin, user } = useCurrentUser();
  const [showReviewError, setShowReviewError] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);

  // Memoized values
  const boardingHouseId = useMemo(() => id || DEFAULT_BOARDING_HOUSE_ID, [id]);
  const [isFavorite, setIsFavorite] = useState(false);

  // State
  const [data, setData] = useState({
    boardingHouseDetail: null,
    roomType: null,
    reviews: [],
  });

  const [ui, setUi] = useState({
    loading: true,
    error: null,
    refreshing: false,
    roomTypesPosition: 0,
    isScrollReady: false,
  });

  // Simplified pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 2,
    hasNext: false,
    hasPrev: false,
  });

  // Memoized computed values
  const formattedAddress = useMemo(() => {
    return getLocalizedAddress(
      data.boardingHouseDetail?.address,
      i18next.language
    );
  }, [data.boardingHouseDetail?.address, i18next.language]);

  const priceRangeText = useMemo(
    () =>
      `${formatAmount(data.boardingHouseDetail?.priceRange)}/${t(
        'roomTypeCard.month'
      )}`,
    [data.boardingHouseDetail?.priceRange, t]
  );

  // API Functions
  const fetchBoardingHouse = useCallback(async () => {
    const response = await getBoardingHouseDetail(boardingHouseId);
    return response;
  }, [boardingHouseId]);

  const fetchRoomTypes = useCallback(async () => {
    const response = await getRoomTypeByBhId(boardingHouseId);
    return response?.data || [];
  }, [boardingHouseId]);

  // Favorite management
  useEffect(() => {
    const handler = ({ id: changedId, isFavorite }) => {
      if (String(changedId) === String(boardingHouseId)) {
        setIsFavorite(isFavorite);
        setData((prev) => ({
          ...prev,
          boardingHouseDetail: {
            ...prev.boardingHouseDetail,
            // likes: isFavorite
            // ? prev.boardingHouseDetail.likes + 1
            // : prev.boardingHouseDetail.likes - 1,
          },
        }));
      }
    };

    emitter.on('favoriteChanged', handler);
    return () => {
      emitter.off('favoriteChanged', handler);
    };
  }, [boardingHouseId]);

  const handleFavoriteClick = async () => {
    try {
      const response = await addFavorite(boardingHouseId);
      if (!response) return;

      const { isFavorite } = response;
      setIsFavorite(isFavorite);

      setData((prev) => ({
        ...prev,
        boardingHouseDetail: {
          ...prev.boardingHouseDetail,
          likes: isFavorite
            ? prev.boardingHouseDetail.likes + 1
            : prev.boardingHouseDetail.likes - 1,
        },
      }));

      emitter.emit('favoriteChanged', {
        id: String(boardingHouseId),
        isFavorite,
      });
    } catch (error) {
      router.push('/login');
    }
  };

  // Fixed fetchReviews function - removed circular dependency
  const fetchReviews = useCallback(
    async ({
      page = 1,
      limit = 2,
      boardingHouseId: bhId,
      append = false,
    } = {}) => {
      try {
        const params = {
          page,
          limit,
        };

        const response = await getReviewByBhId(bhId || boardingHouseId, params);

        if (response?.success && response?.data) {
          const newReviews = response.data || [];

          // Update reviews state properly
          setData((prev) => ({
            ...prev,
            reviews: append ? [...prev.reviews, ...newReviews] : newReviews,
          }));

          // Update pagination with response data
          const paginationData = response.pagination || {};
          setPagination({
            currentPage: paginationData.currentPage || page,
            totalPages: paginationData.totalPages || 1,
            totalItems: paginationData.totalItems || 0,
            limit: paginationData.limit || limit,
            hasNext: paginationData.hasNext || false,
            hasPrev: paginationData.hasPrev || false,
          });
          setReviews(response.data);
          return response;
        }

        return { data: [], pagination: {} };
      } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        throw error;
      }
    },
    [boardingHouseId]
  );

  // Debug pagination changes
  useEffect(() => {
    // Debug pagination changes if needed
  }, [pagination]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const favoriteResponse = await getFavorite();

      const favoriteIds = Array.isArray(favoriteResponse?.favorites)
        ? favoriteResponse.favorites.map((fav) => fav.id)
        : [];

      const isLiked = favoriteIds.includes(boardingHouseId);
      setIsFavorite(isLiked);
    } catch (error) {
      // console.error('❌ Error checking favorite status:', error);
    }
  }, [boardingHouseId]);

  const fetchAllData = useCallback(async () => {
    if (!boardingHouseId) {
      setUi((prev) => ({
        ...prev,
        error: t('boardingHouseIdRequired'),
        loading: false,
      }));
      return;
    }

    setUi((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [boardingHouseDetail, roomType] = await Promise.all([
        fetchBoardingHouse(),
        fetchRoomTypes(),
      ]);

      setData((prev) => ({
        ...prev,
        boardingHouseDetail,
        roomType,
        reviews: [], // Reset reviews
      }));

      // Reset pagination
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 2,
        hasNext: false,
        hasPrev: false,
      });

      // Gọi riêng check favorite
      await checkFavoriteStatus();
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setUi((prev) => ({ ...prev, error: t('failedToLoadData') }));
    } finally {
      setUi((prev) => ({ ...prev, loading: false }));

      setTimeout(() => {
        setUi((prev) => ({ ...prev, isScrollReady: true }));
      }, SCROLL_READY_DELAY);
    }
  }, [
    boardingHouseId,
    fetchBoardingHouse,
    fetchRoomTypes,
    checkFavoriteStatus,
    t,
  ]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  // Event Handlers
  const onRefresh = useCallback(async () => {
    setUi((prev) => ({ ...prev, refreshing: true, isScrollReady: false }));

    try {
      await fetchAllData();
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setUi((prev) => ({ ...prev, refreshing: false }));
    }
  }, [fetchAllData]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  }, [router]);

  // Scroll Functions
  const onRoomTypesLayout = useCallback((event) => {
    const { y } = event.nativeEvent.layout;
    setUi((prev) => ({ ...prev, roomTypesPosition: y }));
  }, []);

  const scrollToRoomTypes = useCallback(() => {
    if (!scrollViewRef.current || !ui.isScrollReady) {
      return;
    }

    if (ui.roomTypesPosition > 0) {
      scrollViewRef.current.scrollTo({
        y: ui.roomTypesPosition - SCROLL_OFFSET,
        animated: true,
      });
      return;
    }

    // Fallback: scroll to end first, then to position
    scrollViewRef.current.scrollToEnd({ animated: true });

    setTimeout(() => {
      if (ui.roomTypesPosition > 0 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: ui.roomTypesPosition - SCROLL_OFFSET,
          animated: true,
        });
      }
    }, SCROLL_TO_ROOM_DELAY);
  }, [ui.roomTypesPosition, ui.isScrollReady]);
  const hasUserReviewed = useMemo(() => {
    if (!user?._id || !reviews?.length) return false;
    return reviews.some(
      (review) =>
        // review.accountId === user._id ||
        review.accountId?._id === user._id
    );
  }, [reviews, user?._id]);

  // Write Review Handler
  const handleWriteReview = useCallback(() => {
    if (!isLogin) {
      router.push('/login');
      return;
    }
    if (hasUserReviewed) {
      setShowReviewError(true);
      return;
    }

    router.push({
      pathname: '/BhDetail/addReview',
      params: { boardingHouseId },
    });
  }, [isLogin, hasUserReviewed, router, boardingHouseId]);

  // Render Functions - Memoized for better performance
  const LoadingState = useMemo(
    () => (
      <ScreenContainer withPadding={false}>
        <BackHeader animationType="slide" title={t('boardingHouseDetail')} />
        <Loader
          text={t('loadingBoardingHouseDetails')}
          color={isDarkMode ? '#3B82F6' : '#1D4ED8'}
        />
      </ScreenContainer>
    ),
    [t, isDarkMode]
  );

  const ErrorState = useMemo(
    () => (
      <ScreenContainer withPadding={true}>
        <BackHeader animationType="slide" title={t('boardingHouseDetail')} />
        <View className="flex-1 justify-center items-center px-4">
          <View className="items-center">
            <Text className="text-red-500 text-center text-lg font-medium mb-6">
              {ui.error}
            </Text>
            <Text
              className={`text-base underline ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}
              onPress={onRefresh}
            >
              {t('retry')}
            </Text>
          </View>
        </View>
      </ScreenContainer>
    ),
    [ui.error, isDarkMode, t, onRefresh]
  );

  const renderBoardingHouseName = () => (
    <Text className="mt-2" variant="h2" weight="bold">
      {data.boardingHouseDetail?.name || t('boardingHouseTypeUnknown')}
    </Text>
  );

  const renderBoardingHouseType = () => (
    <View className="mt-4">
      <Text
        className="bg-blue-400 rounded-lg px-2 py-1 self-start"
        variant="subtitle"
        weight="bold"
        style={{ color: '#fff' }}
      >
        {coverBhType(
          data.boardingHouseDetail?.boardingHouseType?.codeName,
          currentLanguage
        ) || t('boardingHouseTypeUnknown')}
      </Text>
    </View>
  );

  const renderPriceRange = () => (
    <View className="mt-4">
      <Text variant="subtitle" weight="bold">
        {t('priceRange')}:
      </Text>
      <View className="flex-row justify-between items-center mt-1">
        <Text
          weight="bold"
          variant="h3"
          style={{ color: isDarkMode ? 'white' : 'rgb(249 115 22)' }}
          className="flex-1"
        >
          {priceRangeText}
        </Text>
        <Button
          onPress={scrollToRoomTypes}
          disabled={!ui.isScrollReady}
          style={{ backgroundColor: 'rgb(249 115 22)' }}
        >
          {t('selectRoom')}
        </Button>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="mt-4">
      <Text variant="subtitle" weight="bold">
        {t('address')}:
      </Text>
      <Text
        className={`text-base ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {formattedAddress}
      </Text>
    </View>
  );

  const renderLikeCount = () => (
    <View className="mt-4 flex-row justify-between">
      <View className="flex-1 mr-2">
        <Text variant="subtitle" weight="bold">
          {t('likeCount')}:
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleFavoriteClick}>
            <AntDesign
              name={isFavorite ? 'heart' : 'hearto'}
              size={20}
              color={isFavorite ? 'red' : isDarkMode ? '#fff' : '#444'}
            />
          </TouchableOpacity>
          <Text
            className={`text-base font-semibold ml-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            {data.boardingHouseDetail?.likes || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOwnerInfo = () => (
    <View className="mt-4">
      <Text variant="subtitle" weight="bold">
        {t('ownerInfo.title')}:
      </Text>
      <OwnerInfo ownerData={data.boardingHouseDetail?.ownerId} />
    </View>
  );

  const renderExtraPrices = () => (
    <ExtraPrices
      t={t}
      boardingHouse={data.boardingHouseDetail}
      formatAmount={formatAmount}
    />
  );

  const renderDescription = () => (
    <Description boardingHouse={data.boardingHouseDetail} t={t} />
  );

  const renderRoomTypes = () => {
    if (!data.roomType || data.roomType.length === 0) {
      return (
        <View className="mt-4" onLayout={onRoomTypesLayout}>
          <Text
            className={`text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('noRoomTypesAvailable')}
          </Text>
        </View>
      );
    }

    return (
      <View className="mt-4" onLayout={onRoomTypesLayout}>
        <Text variant="subtitle" weight="bold">
          {t('availableRoomTypes')}
        </Text>
        {data.roomType.map((roomData, index) => (
          <RoomTypeCard
            key={`room-${roomData.id || index}`}
            roomData={roomData}
            onDeposit={(roomData) => {
              router.push({
                pathname: '/(screens)/BhDetail/depositRoom',
                params: {
                  roomData: JSON.stringify(roomData),
                },
              });
            }}
          />
        ))}
      </View>
    );
  };

  // Updated renderReviewList
  const renderReviewList = () => {
    return (
      <View className="mt-4">
        <Text variant="subtitle" weight="bold">
          {t('ratingAndReview')}{' '}
          {pagination.totalItems > 0 && `(${pagination.totalItems})`}
        </Text>
        <ReviewList
          fetchReviews={fetchReviews}
          bhId={boardingHouseId}
          reviews={data.reviews}
          boardingHouse={data.boardingHouseDetail}
          onWriteReview={handleWriteReview}
          canWriteReview={true}
          totalReviews={pagination.totalItems}
          pagination={pagination}
          setPagination={setPagination}
          onReport={(reviewId) => {
            console.log('Report review:', reviewId);
          }}
          setReviewId={(reviewId) => {
            console.log('Set review ID:', reviewId);
          }}
          reportedReviews={[]}
          pagination={pagination}
        />
      </View>
    );
  };

  // Early returns for loading and error states
  if (ui.loading && !ui.refreshing) {
    return LoadingState;
  }

  if (ui.error) {
    return ErrorState;
  }

  return (
    <ScreenContainer withPadding={false} className="pb-16">
      <BackHeader
        title={data.boardingHouseDetail?.name || t('boardingHouseDetail')}
        onBackPress={handleBackPress}
      />

      {ui.refreshing && (
        <Loader
          overlay={true}
          text={t('refreshingData')}
          color={isDarkMode ? '#3B82F6' : '#1D4ED8'}
        />
      )}

      <ScrollView
        ref={scrollViewRef}
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <BoardingHouseGallery
          boardingHouseId={id}
          images={data.boardingHouseDetail?.images || []}
        />

        {renderBoardingHouseName()}
        {renderBoardingHouseType()}
        {renderPriceRange()}
        {renderAddress()}
        {renderLikeCount()}
        {renderOwnerInfo()}
        {renderExtraPrices()}
        {renderDescription()}

        <Line className="mt-8" />

        {renderRoomTypes()}
        <Line className="mt-8" />

        {renderReviewList()}
      </ScrollView>
      <ConfirmModal
        visible={showReviewError}
        onClose={() => setShowReviewError(false)}
        onConfirm={() => setShowReviewError(false)}
        title={t('review.alreadySubmittedTitle')}
        message={t('review.alreadySubmittedMessage')}
        confirmText={t('review.confirmButton')}
        cancelText=""
      />
    </ScreenContainer>
  );
}
