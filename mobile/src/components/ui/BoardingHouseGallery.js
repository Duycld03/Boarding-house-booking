import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider'; // Adjust import path as needed
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

const BoardingHouseGallery = ({
    images,
    onReport,
    onSave,
    isReported,
    isOwner = false,
    boardingHouseId
}) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation('BhDetail');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const mainCarouselRef = useRef(null);
    const thumbsCarouselRef = useRef(null);
    const autoPlayRef = useRef(null);

    // Kiểm tra nếu không có ảnh
    if (!images || images.length === 0) {
        return (
            <View className={`flex-1 justify-center items-center p-5 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('noImages', 'Không có ảnh')}
                </Text>
            </View>
        );
    }

    // Auto play effect
    useEffect(() => {
        if (images.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % images.length;
                    mainCarouselRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                    return nextIndex;
                });
            }, 2500);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [images.length]);

    // Fetch watch later status
    useEffect(() => {
        const fetchWatchLaterStatus = async () => {
            try {
                // Thay thế bằng API call thực tế của bạn
                // const response = await getWatchLater(boardingHouseId);
                // setIsSaved(response.isWatchLater);
            } catch (error) {
                console.error('Error fetching watch later status:', error);
            }
        };

        if (boardingHouseId) {
            fetchWatchLaterStatus();
        }
    }, [boardingHouseId]);

    // Handle save click
    const handleSaveClick = async () => {
        if (!boardingHouseId || isOwner) return;

        setLoading(true);
        try {
            // Thay thế bằng API call thực tế của bạn
            // const response = await createWatchLater(boardingHouseId);
            // if (response && response.isWatchLater !== undefined) {
            //   setIsSaved(response.isWatchLater);
            // }

            // Tạm thời toggle state để demo
            setIsSaved(!isSaved);
            setShowMenu(false);
        } catch (error) {
            Alert.alert(
                t('error', 'Lỗi'),
                t('loginRequired', 'Vui lòng đăng nhập để lưu nhà trọ này')
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle report click
    const handleReportClick = () => {
        if (isOwner || isReported) return;

        Alert.alert(
            t('reportTitle', 'Báo cáo nhà trọ'),
            t('reportConfirm', 'Bạn có chắc chắn muốn báo cáo nhà trọ này không?'),
            [
                {
                    text: t('cancel', 'Hủy'),
                    style: 'cancel'
                },
                {
                    text: t('report', 'Báo cáo'),
                    style: 'destructive',
                    onPress: () => {
                        onReport();
                        setShowMenu(false);
                    }
                }
            ]
        );
    };

    // Handle main carousel scroll
    const handleMainScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / screenWidth);

        if (index !== currentIndex) {
            setCurrentIndex(index);

            // Sync thumbnails
            if (thumbsCarouselRef.current && index < images.length) {
                const thumbWidth = (screenWidth - 60) / 4;
                const thumbOffset = index * thumbWidth;
                thumbsCarouselRef.current.scrollToOffset({
                    offset: thumbOffset,
                    animated: true
                });
            }
        }
    };

    // Handle thumbnail press
    const handleThumbnailPress = (index) => {
        setCurrentIndex(index);
        mainCarouselRef.current?.scrollToIndex({ index, animated: true });
    };

    // Pause and resume autoplay
    const pauseAutoplay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    const resumeAutoplay = () => {
        if (images.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % images.length;
                    mainCarouselRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                    return nextIndex;
                });
            }, 2500);
        }
    };

    // Render main carousel item
    const renderMainItem = ({ item }) => (
        <View className="w-full h-80">
            <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
            />
        </View>
    );

    // Render thumbnail item
    const renderThumbnailItem = ({ item, index }) => (
        <TouchableOpacity
            className={`w-20 h-16 mx-1 rounded-lg overflow-hidden ${currentIndex === index
                ? 'border-2 border-blue-500'
                : isDarkMode
                    ? 'border border-gray-600'
                    : 'border border-gray-300'
                }`}
            onPress={() => handleThumbnailPress(index)}
        >
            <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // Get tooltip text for save button
    const getSaveTooltip = () => {
        if (isSaved) {
            return t('saved', 'Đã lưu!');
        }
        return t('saveTooltip', 'Lưu nhà trọ này');
    };

    // Get tooltip text for report button
    const getReportTooltip = () => {
        if (isReported) {
            return t('reportedTooltip', 'Bạn đã báo cáo nhà trọ này. Vui lòng chờ admin xử lý.');
        }
        return t('reportTooltip', 'Báo cáo nhà trọ này');
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Menu Button */}
            <TouchableOpacity
                className="absolute top-10 right-5 z-50 bg-black bg-opacity-50 rounded-full p-2"
                onPress={() => setShowMenu(true)}
            >
                <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                    color="white"
                />
            </TouchableOpacity>

            {/* Main Carousel */}
            <View className="h-80">
                <FlatList
                    ref={mainCarouselRef}
                    data={images}
                    renderItem={renderMainItem}
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleMainScroll}
                    keyExtractor={(item, index) => `main-${item._id || index}`}
                    onTouchStart={pauseAutoplay}
                    onTouchEnd={resumeAutoplay}
                />
            </View>

            {/* Pagination Dots */}
            <View className="flex-row justify-center items-center py-3">
                {images.map((_, index) => (
                    <View
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${currentIndex === index
                            ? 'bg-blue-500'
                            : isDarkMode
                                ? 'bg-gray-600'
                                : 'bg-gray-300'
                            }`}
                    />
                ))}
            </View>

            {/* Thumbnails Carousel */}
            <View className="h-20 mt-2">
                <FlatList
                    ref={thumbsCarouselRef}
                    data={images}
                    renderItem={renderThumbnailItem}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `thumb-${item._id || index}`}
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                />
            </View>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black bg-opacity-50 justify-center items-center"
                    onPress={() => setShowMenu(false)}
                >
                    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-5 min-w-48`}>
                        {/* Save Option */}
                        <TouchableOpacity
                            className={`flex-row items-center py-3 px-4 ${(isOwner || loading) ? 'opacity-50' : 'opacity-100'
                                }`}
                            onPress={handleSaveClick}
                            disabled={isOwner || loading}
                        >
                            <Ionicons
                                name={isSaved ? "bookmark" : "bookmark-outline"}
                                size={24}
                                color="#FFC107"
                            />
                            <Text className={`text-base ml-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {isSaved ? t('saved', 'Đã lưu') : t('save', 'Lưu')}
                            </Text>
                            {loading && (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFC107"
                                    className="ml-2"
                                />
                            )}
                        </TouchableOpacity>

                        {/* Report Option */}
                        <TouchableOpacity
                            className={`flex-row items-center py-3 px-4 ${(isOwner || isReported) ? 'opacity-50' : 'opacity-100'
                                }`}
                            onPress={handleReportClick}
                            disabled={isOwner || isReported}
                        >
                            <Ionicons
                                name={isReported ? "flag" : "flag-outline"}
                                size={24}
                                color="#F44336"
                            />
                            <Text className={`text-base ml-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {t('report', 'Báo cáo')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default BoardingHouseGallery;