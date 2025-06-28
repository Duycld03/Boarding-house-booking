import { Text, Avatar } from '@/components/ui';
import { View, TouchableOpacity, Image, Modal, ScrollView, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; // Import Vietnamese locale if needed
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import ImageGrid from './ImageGrid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useRouter } from 'expo-router';
import { useCurrentUser } from '@/context/userContext';
import { deleteReviewUser } from '@/API/reviewAPI';
import { useNotification } from "@/context/NotificationProvider";
import { ConfirmModal } from '@/components/feedback';


// Enable relative time plugin
dayjs.extend(relativeTime);

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function ReviewCard({ t, review, onPress, onImagePress, locale = 'en', navigation }) {
    const { i18n } = useTranslation();
    const { isDarkMode } = useTheme();
    const { themedClasses } = useThemedClasses();
    const router = useRouter();
    const { user, isLogin } = useCurrentUser();
    const isMyReview = user && review?.accountId?._id === user._id;
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [deleteReviewId, setDeleteReviewId] = useState(null);
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(false);

    // State for image modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [modalImages, setModalImages] = useState([]);

    // Set dayjs locale
    dayjs.locale(i18n.language);

    // Render stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <View
                    key={`full-${i}`}
                    className='mr-1'>
                    <FontAwesome
                        name="star"
                        size={14}
                        color={isDarkMode ? '#FFD700' : '#FBBF24'}
                    />
                </View>
            );
        }
        // Half star
        if (hasHalfStar) {
            stars.push(
                <FontAwesome
                    key="half"
                    name="star-half-o"
                    size={14}
                    color={isDarkMode ? '#FFD700' : '#FBBF24'}
                />
            );
        }

        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome
                    key={`empty-${i}`}
                    name="star-o"
                    size={14}
                    color={isDarkMode ? '#6B7280' : '#D1D5DB'}
                />
            );
        }

        return stars;
    };

    // Format time
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const reviewDate = dayjs(timestamp);
        const now = dayjs();
        const diffDays = now.diff(reviewDate, 'day');

        if (diffDays < 7) {
            return reviewDate.fromNow(); // "2 days ago"
        } else {
            return reviewDate.format('DD/MM/YYYY');
        }
    };

    // Truncate long review text
    const truncateText = (text, maxLength = 150) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Handle image press in review
    const handleImagePress = (images, selectedIndex) => {
        // Show modal with images
        setModalImages(images);
        setSelectedImageIndex(selectedIndex);
        setModalVisible(true);

        // Also call original onImagePress if provided
        if (onImagePress) {
            onImagePress({
                images,
                selectedIndex,
                reviewId: review?.id,
                reviewerName: review?.accountId?.fullname,
                reviewRating: review?.rating
            });
        }
    };

    // Close modal
    const closeModal = () => {
        setModalVisible(false);
        setModalImages([]);
        setSelectedImageIndex(0);
    };

    // Navigate to previous image
    const goToPreviousImage = () => {
        const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : modalImages.length - 1;
        setSelectedImageIndex(newIndex);
    };

    // Navigate to next image
    const goToNextImage = () => {
        const newIndex = selectedImageIndex < modalImages.length - 1 ? selectedImageIndex + 1 : 0;
        setSelectedImageIndex(newIndex);
    };

    const Wrapper = onPress ? TouchableOpacity : View;
    const handleMenuAction = (action) => {
        if (action === 'report' && !isLogin) {
            router.push('/login');
            return;
        }
        switch (action) {
            case 'update':
                router.push({
                    pathname: '/(screens)/BhDetail/updateReview',
                    params: { reviewId: review._id.toString() },
                });
                break;
            case 'delete':
                alert('Delete action triggered');
                break;
            case 'report':
                if (!review?._id) {
                    showError("Review ID is missing or invalid!");
                    return;
                }

                router.push({
                    pathname: "/(screens)/BhDetail/report",
                    params: {
                        reviewId: review?.id,
                        boardingHouseId: boardingHouse._id
                    },
                });
                break;
            default:
                break;
        }
    };
    const handleDeleteReview = async () => {
        if (!deleteReviewId) return;
        setLoading(true);

        try {
            const response = await deleteReviewUser(deleteReviewId);
            if (response?.success) {
                showSuccess(t("reviewCard.deleteSuccess") || "Review deleted successfully!");
            } else {
                showError(response.message || t('reviewCard.deleteFailed'));
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showError(t('reviewCard.deleteFailed'));

        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Wrapper
                onPress={onPress}
                className={`
                    flex-1,
                    ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
                    rounded-xl 
                    p-4 
                    mb-3 
                    shadow-sm 
                    border 
                    ${onPress ? (isDarkMode ? 'active:bg-gray-700' : 'active:bg-gray-50') : ''}
                `}
                activeOpacity={0.7}
            >
                {/* Header với avatar và thông tin user */}
                <View className="flex-row items-start mb-3">

                    <Avatar
                        source={review?.accountId?.avatarImage?.url}
                        fallbackText={review?.accountId?.fullname || t('reviewCard.anonymous')}
                        size="md"
                        className="mr-3"
                    />

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className={`font-semibold text-base flex-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {review?.accountId?.fullname || t('reviewCard.anonymous')}
                            </Text>

                            {/* {review?.createdAt && (
                                <Text className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formatTime(review.createdAt)}
                                </Text>
                            )} */}

                        </View>

                        {/* Rating stars */}
                        {review?.rating && (
                            <View className="flex-row items-center mb-2">
                                <View className="flex-row mr-2">
                                    {renderStars(review.rating)}
                                </View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {review.rating.toFixed(1)}
                                </Text>
                            </View>
                        )}
                        {review?.createdAt && (
                            <Text className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTime(review.createdAt)}
                            </Text>
                        )}
                    </View>
                    <Menu>
                        <MenuTrigger style={{ paddingHorizontal: 10 }}>
                            <FontAwesome
                                name="ellipsis-v"
                                size={20}
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </MenuTrigger>

                        <MenuOptions
                            customStyles={{
                                optionsContainer: {
                                    padding: 10,
                                    borderRadius: 8,
                                    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowRadius: 6,
                                    marginTop: 22,
                                    marginLeft: -10,
                                    width: 120,
                                },
                                optionWrapper: {
                                    paddingVertical: 8,
                                    paddingHorizontal: 15,
                                },
                                optionText: {
                                    fontSize: 14,
                                    color: isDarkMode ? '#E2E8F0' : '#1A202C',
                                },
                            }}
                        >
                            {isLogin && isMyReview && (
                                <>
                                    <MenuOption onSelect={() => handleMenuAction('update')}>
                                        <Text style={{ color: isDarkMode ? '#FBBF24' : '#1D4ED8', fontWeight: '500' }}>
                                            {t('reviewCard.update')}
                                        </Text>
                                    </MenuOption>
                                    <MenuOption onSelect={() => {
                                        setDeleteReviewId(review._id); // Lưu ID
                                        setIsDeleteModalVisible(true); // Hiển thị modal
                                    }}>
                                        <Text style={{ color: 'red', fontWeight: '500' }}>
                                            {t('reviewCard.delete')}
                                        </Text>
                                    </MenuOption>
                                </>
                            )}

                            {(!isLogin || (isLogin && !isMyReview)) && (
                                <MenuOption onSelect={() => handleMenuAction('report')}>
                                    <Text style={{ color: isDarkMode ? '#FBBF24' : '#1D4ED8', fontWeight: '500' }}>
                                        {t('reviewCard.report')}
                                    </Text>
                                </MenuOption>
                            )}
                        </MenuOptions>
                    </Menu>
                </View>

                {/* Review content */}
                {review?.content && (
                    <View className="mb-2">
                        <Text className={`text-sm leading-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {truncateText(review.content)}
                        </Text>
                    </View>
                )}

                {/* Render Review Images using ImageGrid */}
                {review?.images && review.images.length > 0 && (
                    <View className="mb-3 w-full overflow-hidden">
                        <ImageGrid
                            images={review.images}
                            onImagePress={handleImagePress}
                            maxVisibleImages={3}
                            spacing={4}
                            borderRadius={8}
                            containerStyle={{
                                marginTop: 8,
                                width: '100%',
                            }}
                        />
                    </View>
                )}

                {/* Helpful/Like actions */}
                {review?.helpfulCount !== undefined && (
                    <View className={`flex-row items-center justify-between mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <TouchableOpacity className="flex-row items-center">
                            <FontAwesome
                                name="thumbs-o-up"
                                size={14}
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                style={{ marginRight: 4 }}
                            />
                            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('reviewCard.helpful')} ({review.helpfulCount})
                            </Text>
                        </TouchableOpacity>

                        {onPress && (
                            <TouchableOpacity>
                                <Text className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {t('reviewCard.readMore')}
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>
                )}
            </Wrapper>
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDeleteReview}
                title={t('reviewCard.confirmDelete')}
                message={t('reviewCard.deleteMessage')}
                confirmText={t('reviewCard.confirm')}
                cancelText={t('reviewCard.cancel')}
                dangerMode
            />
            {/* Image Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
                statusBarTranslucent
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {/* Close button */}
                    <TouchableOpacity
                        onPress={closeModal}
                        loading={loading}
                        style={{
                            position: 'absolute',
                            top: 50,
                            right: 20,
                            zIndex: 1000,
                            padding: 10,
                        }}
                    >
                        <FontAwesome
                            name="times"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>

                    {/* Image counter */}
                    {modalImages.length > 1 && (
                        <View style={{
                            position: 'absolute',
                            top: 50,
                            left: 20,
                            zIndex: 1000,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                        }}>
                            <Text style={{ color: 'white', fontSize: 14 }}>
                                {selectedImageIndex + 1} / {modalImages.length}
                            </Text>
                        </View>
                    )}

                    {/* Main image */}
                    <ScrollView
                        contentContainerStyle={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <Image
                            source={{ uri: modalImages[selectedImageIndex]?.imageUrl }}
                            style={{
                                width: screenWidth,
                                height: screenHeight * 0.7,
                                resizeMode: 'contain',
                            }}
                        />
                    </ScrollView>

                    {/* Navigation arrows */}
                    {modalImages.length > 1 && (
                        <>
                            {/* Previous button */}
                            <TouchableOpacity
                                onPress={goToPreviousImage}
                                style={{
                                    position: 'absolute',
                                    left: 20,
                                    top: '50%',
                                    marginTop: -25,
                                    padding: 15,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    borderRadius: 25,
                                }}
                            >
                                <FontAwesome
                                    name="chevron-left"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>

                            {/* Next button */}
                            <TouchableOpacity
                                onPress={goToNextImage}
                                style={{
                                    position: 'absolute',
                                    right: 20,
                                    top: '50%',
                                    marginTop: -25,
                                    padding: 15,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    borderRadius: 25,
                                }}
                            >
                                <FontAwesome
                                    name="chevron-right"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Thumbnail strip */}
                    {modalImages.length > 1 && (
                        <View style={{
                            position: 'absolute',
                            bottom: 40,
                            left: 0,
                            right: 0,
                            height: 80,
                        }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    alignItems: 'center',
                                }}
                            >
                                {modalImages.map((image, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedImageIndex(index)}
                                        style={{
                                            marginRight: 8,
                                            borderWidth: selectedImageIndex === index ? 2 : 0,
                                            borderColor: 'white',
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Image
                                            source={{ uri: image.imageUrl }}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 6,
                                                opacity: selectedImageIndex === index ? 1 : 0.6,
                                            }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </Modal>
        </>
    );
}

export default ReviewCard;