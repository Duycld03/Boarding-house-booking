import { useState, useEffect, useMemo } from "react";
import { View, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button } from '@/components/ui';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useThemedClasses } from '@/utils/useTheme';
import ReviewCard from "./ReviewCard";
import Svg, { Circle } from 'react-native-svg';
import {
    getReviewByBhId,
} from "@/API/ownerUser/boardingHouse";

// Mock components - replace with actual React Native equivalents
const CircularProgress = ({ percent, rating, themedClasses }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: 128,
            height: 128
        }}>
            <Svg
                width={150}
                height={150}
                viewBox="0 0 100 100"
                style={{ position: 'absolute' }}
            >
                <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                />
                <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#60A5FA"
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
            </Svg>

            {/* Center text */}
            <View style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text
                    weight="bold"
                    variant="h3"
                >
                    {rating.toFixed(1)}/5
                </Text>
            </View>
        </View>
    );
};

const EmptyState = ({ themedClasses, t, onWriteReview }) => {
    const { isDarkMode } = useTheme(); // ✅ Gọi đúng chỗ

    return (
        <View className={`flex-1 items-center justify-center py-16 ${themedClasses.background}`}>
            <FontAwesome
                name="comments-o"
                size={64}
                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                style={{ marginBottom: 16 }}
            />
            <Text className={`text-lg mb-2 ${themedClasses.text}`}>
                {t?.("reviewList.noReviewsYet") || "No reviews yet"}
            </Text>
            <Text className={`text-sm mb-6 ${themedClasses.textSecondary} text-center px-4`}>
                {t?.("reviewList.beFirstToReview") || "Be the first to share your experience!"}
            </Text>
            <Button
                onPress={onWriteReview}
                variant="primary"
                size="md"
            >
                {t('writeAReview')}
            </Button>
        </View>
    );
};


const ReviewList = ({
    reviews = [],
    onReport,
    setReviewId,
    reportedReviews = [],
    fetchReviews,
    boardingHouse,
    onWriteReview,
    canWriteReview = true,
    totalReviews = 0,
    setPagination,
    pagination,
    bhId
}) => {
    const handleWriteReview = () => {
        if (typeof onWriteReview === 'function') {
            onWriteReview();
        }
    };
    const { isDarkMode } = useTheme();
    const { t } = useTranslation('boardingHouseDetail');
    const { themedClasses } = useThemedClasses();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const REVIEWS_PER_PAGE = 5;

    const [reviewList, setReviewList] = useState([]);
    const [reviewPagination, setReviewPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: REVIEWS_PER_PAGE
    });

    const [totalReviewStats, setTotalReviewStats] = useState({
        totalReviews: 0,
        averageRating: 0
    });

    useEffect(() => {
        if (bhId) {
            getReviewByBhId(bhId).then((res) => {
                setReviewList(res.data);
            });
        }
    }, [bhId]);

    useEffect(() => {
        const fetchAndCalculateTotalReviews = async () => {
            if (bhId) {
                try {
                    const response = await getReviewByBhId(bhId);
                    const allReviews = response.data;

                    // Tính toán tổng số review và rating trung bình
                    const validReviews = allReviews.filter(review =>
                        review?.rating &&
                        typeof review.rating === 'number' &&
                        review.rating >= 1 &&
                        review.rating <= 5
                    );

                    const totalRating = validReviews.reduce((sum, review) => sum + review.rating, 0);
                    const avgRating = validReviews.length > 0 ? totalRating / validReviews.length : 0;

                    setTotalReviewStats({
                        totalReviews: validReviews.length,
                        averageRating: avgRating
                    });
                } catch (error) {
                    console.error('Error fetching and calculating total review stats:', error);
                }
            }
        };

        fetchAndCalculateTotalReviews();
    }, [bhId]);

    // Memoized calculations for performance
    const { averageRating, ratingCounts, validReviews } = useMemo(() => {
        if (!reviews?.length) {
            return { averageRating: 0, ratingCounts: {}, validReviews: [] };
        }

        // Filter valid reviews
        const valid = reviews.filter(review =>
            review?.rating &&
            typeof review.rating === 'number' &&
            review.rating >= 1 &&
            review.rating <= 5
        );

        // Calculate rating counts
        const counts = valid.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
        }, {});

        // Calculate average rating
        const totalRating = valid.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = valid.length > 0 ? totalRating / valid.length : 0;

        return {
            averageRating: avgRating,
            ratingCounts: counts,
            validReviews: valid
        };
    }, [reviews]);

    const hasMoreReviews = useMemo(() => {
        if (pagination) {
            return pagination.hasNext || pagination.currentPage < pagination.totalPages;
        }
        return reviews.length < totalReviews;
    }, [pagination, reviews.length, totalReviews]);

    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMoreReviews || !fetchReviews || !boardingHouse?._id) {
            console.log('🚫 Cannot load more:', {
                isLoadingMore,
                hasMoreReviews,
                fetchReviews: !!fetchReviews,
                boardingHouseId: boardingHouse?._id
            });
            return;
        }

        setIsLoadingMore(true);

        try {
            const nextPage = pagination?.currentPage ? pagination.currentPage + 1 : 2;



            await fetchReviews({
                page: nextPage,
                limit: REVIEWS_PER_PAGE,
                boardingHouseId: boardingHouse._id,
                append: true // Important: append new reviews to existing ones
            });

        } catch (error) {
            // You might want to show an error message to the user here
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleInitialLoad = async () => {
        if (!fetchReviews || !boardingHouse?._id || isLoading) {
            return;
        }

        setIsLoading(true);

        try {

            await fetchReviews({
                page: 1,
                limit: REVIEWS_PER_PAGE,
                boardingHouseId: boardingHouse._id,
                append: false // Replace existing reviews
            });

        } catch (error) {
            console.error('Error loading initial reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (boardingHouse?._id && reviews.length === 0 && !isLoading && !isLoadingMore) {
            handleInitialLoad();
        }
    }, [boardingHouse?._id]);



    // Empty state
    if (!isLoading && (!reviews || reviews.length === 0)) {
        return <EmptyState themedClasses={themedClasses} t={t} onWriteReview={onWriteReview} />;
    }

    const allRatings = [5, 4, 3, 2, 1];

    const renderRatingRow = ({ item: star }) => {
        const count = ratingCounts[star] || 0;

        return (
            <View className="flex-row items-center py-1 px-4">
                <Text className={`w-5 text-right text-sm font-medium mr-2 ${themedClasses.text}`}>
                    {count}
                </Text>

                {/* Dãy sao: vàng tương ứng số sao, xám cho phần còn lại */}
                <View className="flex-row ml-2">
                    {[...Array(5)].map((_, index) => (
                        <FontAwesome
                            key={index}
                            name="star"
                            size={16}
                            color={index < star ? '#FBBF24' : '#E5E7EB'}
                            style={{ marginHorizontal: 1 }}
                            className="mr-2"
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderReviewItem = ({ item: review }) => (
        <ReviewCard
            key={review._id}
            review={review}
            t={t}
            onReport={onReport}
            setReviewId={setReviewId}
            reportedReviews={reportedReviews}
            onDeleted={() => { fetchReviews() }}

        />

    );

    // ✅ Improved Load More Button Component
    const renderLoadMoreButton = () => {
        if (!hasMoreReviews) {
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
                        style={{ color: "#10B981" }}
                    >
                        {t?.("reviewList.allReviewsLoaded") || "All reviews loaded"}
                    </Text>
                </View>
            );
        }

        const remainingReviews = totalReviews - reviews.length;
        const reviewsToLoad = Math.min(REVIEWS_PER_PAGE, remainingReviews);

        return (
            <View className="py-6 px-4">
                <TouchableOpacity
                    onPress={handleLoadMore}
                    disabled={isLoadingMore}
                    className={`flex-row items-center justify-center py-4 px-6 rounded-lg border-2 border-dashed ${isLoadingMore
                        ? `${themedClasses.border} opacity-50`
                        : `border-blue-300 ${isDarkMode ? 'border-blue-600' : 'border-blue-300'}`
                        }`}
                    style={{
                        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    }}
                >
                    {isLoadingMore ? (
                        <>
                            {/* Loading animation */}
                            <View className="flex-row items-center mr-3">
                                <View className={`w-2 h-2 rounded-full mr-1 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                    style={{ opacity: 0.4 }} />
                                <View className={`w-2 h-2 rounded-full mr-1 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                    style={{ opacity: 0.6 }} />
                                <View className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                    style={{ opacity: 0.8 }} />
                            </View>
                            <Text className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {t?.("reviewList.loadingMore") || "Loading more reviews..."}
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
                            <Text className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {t?.("reviewList.loadMore") || `Load ${reviewsToLoad} more reviews`}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Progress indicator */}
                <View className="mt-4 items-center">
                    <Text className={`text-xs ${themedClasses.textSecondary} mb-2`}>
                        {reviews.length} of {totalReviews} reviews loaded
                    </Text>
                    <View className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <View
                            className="h-1 rounded-full bg-blue-500"
                            style={{ width: `${totalReviews > 0 ? (reviews.length / totalReviews) * 100 : 0}%` }}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScrollView className={`flex-1 ${themedClasses.background}`}>
            <View className="px-4 py-6">
                {/* Header with Write Review Button */}
                <View className="flex-row justify-between items-center mb-7">
                    {canWriteReview && (
                        <Button
                            onPress={handleWriteReview}
                            variant="primary"
                            size="md"
                        >
                            <FontAwesome name="edit" size={14} color="white" style={{ marginRight: 6 }} />
                            {t('writeAReview')}
                        </Button>
                    )}
                </View>

                {/* Rating Summary */}
                <View className="flex-row flex-wrap justify-center lg:justify-start items-start mb-8">
                    {/* Circular Progress */}
                    <View className="items-center mb-6 lg:mb-0 lg:mr-10">
                        <CircularProgress
                            percent={totalReviewStats.averageRating * 20}
                            rating={totalReviewStats.averageRating}
                            themedClasses={themedClasses}
                        />
                    </View>

                    {/* Rating Breakdown */}
                    <View className="flex-1 min-w-64">
                        <FlatList
                            data={allRatings}
                            renderItem={renderRatingRow}
                            keyExtractor={(item) => item.toString()}
                            scrollEnabled={false}
                        />
                    </View>
                </View>

                {/* Reviews Section */}
                <View className="mb-4">
                    <Text className={`text-xl font-bold ${themedClasses.text}`}>
                        {t?.("totalReview") || "Reviews"} ({totalReviews})
                    </Text>
                </View>

                {/* Initial Loading */}
                {isLoading ? (
                    <View className="py-8 items-center">
                        <View className="flex-row items-center">
                            <FontAwesome
                                name="spinner"
                                size={16}
                                color={themedClasses.textSecondary}
                                style={{ marginRight: 8 }}
                            />
                            <Text className={themedClasses.textSecondary}>
                                {t?.("reviewList.loadingReviews") || "Loading reviews..."}
                            </Text>
                        </View>
                    </View>
                ) : (
                    /* Reviews List */
                    <View>
                        <FlatList
                            data={validReviews}
                            renderItem={renderReviewItem}
                            keyExtractor={(item) => item._id}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Load More Button */}
                        {validReviews.length > 0 && renderLoadMoreButton()}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default ReviewList;