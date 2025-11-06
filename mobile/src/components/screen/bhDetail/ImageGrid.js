import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Image, Text, Modal, FlatList, Dimensions, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Custom hook for grid layout calculations
const useGridLayout = (imageCount, maxVisible, showAll) => {
    return useMemo(() => {
        const visibleCount = showAll ? imageCount : Math.min(imageCount, maxVisible);

        if (visibleCount === 1) return { layout: 'single', rows: 1, cols: 1 };
        if (visibleCount === 2) return { layout: 'double', rows: 1, cols: 2 };
        if (visibleCount === 3) return { layout: 'triple', rows: 2, cols: 2, special: true };
        if (visibleCount === 4) return { layout: 'quad', rows: 2, cols: 2 };
        return { layout: 'grid', rows: 2, cols: 3 };
    }, [imageCount, maxVisible, showAll]);
};

// Individual grid item component
const GridItem = React.memo(({
    image,
    index,
    isLarge,
    spacing,
    styles,
    onPress,
    totalImages,
    hiddenCount,
    maxVisibleImages,
    showAllImages,
    onShowAll,
    t,
    imageSize,
    containerWidth
}) => {
    // Calculate item dimensions based on container width and layout
    const getItemDimensions = useCallback(() => {
        const totalSpacing = spacing * 2; // Spacing between items
        const availableWidth = containerWidth - totalSpacing;

        if (isLarge) {
            const width = availableWidth * 0.8; // 80% of available width for large images
            return { width, height: width * 0.75 }; // Adjusted aspect ratio
        } else {
            const width = availableWidth / 2.2; // Adjusted for better fit
            return { width, height: width * 0.8 };
        }
    }, [isLarge, spacing, containerWidth]);

    const { width: itemWidth, height: itemHeight } = getItemDimensions();

    // Safely extract image URI
    const getImageUri = useCallback((img) => {
        if (typeof img === 'string') return img;
        return img?.imageUrl || img?.url || img?.uri || '';
    }, []);

    const imageUri = getImageUri(image);

    // Handle image load error
    const handleImageError = useCallback((error) => {
        console.warn('Image load error:', error.nativeEvent?.error);
    }, []);

    return (
        <TouchableOpacity
            onPress={() => onPress(image, index)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Image ${index + 1} of ${totalImages}`}
            style={[
                styles.imageContainer,
                {
                    width: itemWidth,
                    height: itemHeight,
                    margin: spacing / 2,
                }
            ]}
        >
            <Image
                source={{ uri: imageUri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                onError={handleImageError}
            />

            {/* Image counter for first image */}
            {index === 0 && totalImages > 1 && (
                <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                        1/{totalImages}
                    </Text>
                </View>
            )}

            {/* Show remaining count overlay */}
            {index === maxVisibleImages - 1 && hiddenCount > 0 && !showAllImages && (
                <TouchableOpacity
                    onPress={onShowAll}
                    style={styles.overlayContainer}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${hiddenCount} more images`}
                >
                    <MaterialIcons name="photo-library" size={24} color="white" />
                    <Text style={styles.overlayText}>
                        +{hiddenCount} {'more'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Expand button for single image */}
            {index === 0 && totalImages === 1 && (
                <View style={styles.expandButton}>
                    <Ionicons name="expand" size={12} color="white" />
                    <Text style={styles.expandButtonText}>
                        {'Expand'}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
});

GridItem.displayName = 'GridItem';

const ImageGrid = ({
    images = [],
    maxVisibleImages = 5,
    onImagePress,
    t,
    containerStyle,
    imageSize = { width: 30, height: 30 },
    spacing = 8,
    borderRadius = 8
}) => {
    const { isDarkMode } = useTheme();
    const [showAllImages, setShowAllImages] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(screenWidth - 64); // Default width minus padding

    const gridLayout = useGridLayout(images.length, maxVisibleImages, showAllImages);

    // Handle container layout to get actual width
    const handleContainerLayout = useCallback((event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    }, []);

    // Memoized styles using StyleSheet for better performance
    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginTop: 12,
            width: '100%', // Ensure full width utilization
        },
        imageContainer: {
            borderRadius,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        },
        imageCounter: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        imageCounterText: {
            color: 'white',
            fontSize: 12,
            fontWeight: '500',
        },
        overlayContainer: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        overlayText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            marginTop: 4,
        },
        expandButton: {
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
        },
        expandButtonText: {
            color: 'white',
            fontSize: 12,
            fontWeight: '500',
            marginLeft: 4,
        },
        gridRow: {
            flexDirection: 'row',
            justifyContent: 'flex-start', // Changed from space-between to flex-start
            marginBottom: 8,
            flexWrap: 'wrap', // Allow wrapping
        },
        singleImageContainer: {
            alignItems: 'flex-start', // Changed from center to flex-start
        },
        seeLessButton: {
            marginTop: 12,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE',
        },
        seeLessText: {
            marginLeft: 4,
            fontSize: 14,
            fontWeight: '500',
            color: isDarkMode ? '#60A5FA' : '#2563EB',
        },
        modalBackground: {
            flex: 1,
            backgroundColor: 'black',
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: '#111827',
        },
        modalHeaderText: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
        },
        closeButton: {
            padding: 8,
        },
        modalImageContainer: {
            width: screenWidth,
            height: screenHeight - 100,
        },
        modalImage: {
            width: '100%',
            height: '100%',
        },
    }), [isDarkMode, borderRadius]);

    // Get visible images based on current state
    const visibleImages = useMemo(() =>
        showAllImages ? images : images.slice(0, maxVisibleImages),
        [images, showAllImages, maxVisibleImages]
    );

    const hiddenCount = Math.max(0, images.length - maxVisibleImages);

    // Handle image press with error boundaries
    const handleImagePress = useCallback((image, index) => {
        try {
            if (onImagePress) {
                onImagePress(images, index);
            } else {
                setSelectedImageIndex(index);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error handling image press:', error);
        }
    }, [images, onImagePress]);

    // Handle show all images
    const handleShowAll = useCallback(() => {
        setShowAllImages(true);
    }, []);

    // Handle modal scroll
    const handleModalScroll = useCallback((event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setSelectedImageIndex(index);
    }, []);

    // Common props for grid items
    const gridItemProps = useMemo(() => ({
        spacing,
        styles,
        onPress: handleImagePress,
        totalImages: images.length,
        hiddenCount,
        maxVisibleImages,
        showAllImages,
        onShowAll: handleShowAll,
        t,
        imageSize,
        containerWidth,
    }), [spacing, styles, handleImagePress, images.length, hiddenCount, maxVisibleImages, showAllImages, handleShowAll, t, imageSize, containerWidth]);

    // Render grid based on layout type
    const renderGrid = useCallback(() => {
        if (visibleImages.length === 0) return null;

        switch (gridLayout.layout) {
            case 'single':
                return (
                    <View style={styles.singleImageContainer}>
                        <GridItem
                            image={visibleImages[0]}
                            index={0}
                            isLarge={true}
                            {...gridItemProps}
                        />
                    </View>
                );

            case 'double':
                return (
                    <View style={styles.gridRow}>
                        {visibleImages.map((image, index) => (
                            <GridItem
                                key={`double-${index}`}
                                image={image}
                                index={index}
                                isLarge={false}
                                {...gridItemProps}
                            />
                        ))}
                    </View>
                );

            case 'triple':
                return (
                    <View>
                        <View style={styles.singleImageContainer}>
                            <GridItem
                                image={visibleImages[0]}
                                index={0}
                                isLarge={true}
                                {...gridItemProps}
                            />
                        </View>
                        <View style={styles.gridRow}>
                            {visibleImages.slice(1).map((image, index) => (
                                <GridItem
                                    key={`triple-${index + 1}`}
                                    image={image}
                                    index={index + 1}
                                    isLarge={false}
                                    {...gridItemProps}
                                />
                            ))}
                        </View>
                    </View>
                );

            default:
                const firstRow = visibleImages.slice(0, gridLayout.cols);
                const secondRow = visibleImages.slice(gridLayout.cols);

                return (
                    <View>
                        <View style={styles.gridRow}>
                            {firstRow.map((image, index) => (
                                <GridItem
                                    key={`first-${index}`}
                                    image={image}
                                    index={index}
                                    isLarge={false}
                                    {...gridItemProps}
                                />
                            ))}
                        </View>
                        {secondRow.length > 0 && (
                            <View style={styles.gridRow}>
                                {secondRow.map((image, index) => (
                                    <GridItem
                                        key={`second-${index + gridLayout.cols}`}
                                        image={image}
                                        index={index + gridLayout.cols}
                                        isLarge={false}
                                        {...gridItemProps}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                );
        }
    }, [visibleImages, gridLayout, styles, gridItemProps]);

    // Modal render item
    const renderModalItem = useCallback(({ item, index }) => {
        const imageUri = typeof item === 'string' ? item : (item?.imageUrl || item?.url || item?.uri || '');

        return (
            <View style={styles.modalImageContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onError={(error) => console.warn('Modal image load error:', error)}
                />
            </View>
        );
    }, [styles]);

    // Modal key extractor
    const modalKeyExtractor = useCallback((item, index) => `modal-image-${index}`, []);

    // Modal get item layout
    const getModalItemLayout = useCallback((data, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
    }), []);

    // Early return if no images
    if (!images || images.length === 0) return null;

    return (
        <View
            style={[styles.container, containerStyle]}
            onLayout={handleContainerLayout}
        >
            {renderGrid()}

            {/* See Less Button */}
            {showAllImages && images.length > maxVisibleImages && (
                <TouchableOpacity
                    onPress={() => setShowAllImages(false)}
                    style={styles.seeLessButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Show fewer images"
                >
                    <Ionicons
                        name="chevron-up"
                        size={16}
                        color={styles.seeLessText.color}
                    />
                    <Text style={styles.seeLessText}>
                        {'See Less'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Image Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                accessibilityViewIsModal={true}
                statusBarTranslucent={true}
            >
                <View style={styles.modalBackground}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>
                            {selectedImageIndex + 1} / {images.length}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                            accessibilityRole="button"
                            accessibilityLabel="Close image viewer"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Image Viewer */}
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={selectedImageIndex}
                        getItemLayout={getModalItemLayout}
                        keyExtractor={modalKeyExtractor}
                        renderItem={renderModalItem}
                        onMomentumScrollEnd={handleModalScroll}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={3}
                        windowSize={5}
                    />
                </View>
            </Modal>
        </View>
    );
};

export default ImageGrid;