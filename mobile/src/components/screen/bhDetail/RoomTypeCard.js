import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import formatAmount from '@/utils/formatAmount';
import { useCurrentUser } from '@/context/userContext'; // Updated import path
import userRoles from '@/constants/userRole';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { ConfirmModal } from '@/components/feedback';

// Constants
const IMAGE_HEIGHT = 200; // Reduced from 256px for better mobile UX
const SHADOW_CONFIG = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Reduced for subtle shadow
    shadowRadius: 3.84,
    elevation: 3, // Reduced elevation
};

const RoomTypeCard = ({
    roomData,
    boardingHouseId,
    ownerId,
    onDeposit, // New prop for deposit handler
    isDepositLoading = false
}) => {
    const { hasRole, isLogin, user } = useCurrentUser();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation('boardingHouseDetail');
    const router = useRouter();

    // States
    const [loginWarningVisible, setLoginWarningVisible] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Memoized values
    const isOwner = useMemo(() => hasRole(userRoles.owner), [hasRole]);

    const facilitiesText = useMemo(() => {
        return roomData?.facilities?.map(item => item.name).join(', ') || t('roomTypeCard.noFacilities', 'No facilities listed');
    }, [roomData?.facilities, t]);

    const isRoomAvailable = useMemo(() => {
        return roomData?.availableRoom > 0;
    }, [roomData?.availableRoom]);

    // Theme styles
    const containerStyle = useMemo(() => ({
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    }), [isDarkMode]);

    const textStyle = useMemo(() => ({
        primary: isDarkMode ? 'text-white' : 'text-gray-800',
        secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        divider: isDarkMode ? 'bg-gray-600' : 'bg-gray-300',
    }), [isDarkMode]);

    // Handlers
    const handleToggleLoginWarning = useCallback(() => {
        setLoginWarningVisible(prev => !prev);
    }, []);

    const handleMakeAppointment = useCallback(() => {
        if (!isLogin) {
            handleToggleLoginWarning();
            return;
        }

        if (!isRoomAvailable) {
            // Could show a different modal for unavailable rooms
            return;
        }

        router.push({
            pathname: '/(screens)/BhDetail/createAppointment',
            params: {
                boardingHouseId,
                roomTypeId: roomData?._id,
                ownerId: ownerId?._id,
            }
        });
    }, [isLogin, isRoomAvailable, router, boardingHouseId, roomData?._id, ownerId?._id, handleToggleLoginWarning]);

    const handleGoToLogin = useCallback(() => {
        setLoginWarningVisible(false);
        router.push('/(auth)/login');
    }, [router]);

    const handleDeposit = useCallback(() => {
        if (!isLogin) {
            handleToggleLoginWarning();
            return;
        }

        if (!isRoomAvailable) {
            return;
        }

        onDeposit?.(roomData);
    }, [isLogin, isRoomAvailable, onDeposit, roomData, handleToggleLoginWarning]);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    // Render fallback image
    const renderImage = () => {
        if (imageError || !roomData?.image?.imageUrl) {
            return (
                <View
                    className={`w-full rounded-lg mb-4 justify-center items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    style={{ height: IMAGE_HEIGHT }}
                >
                    <FontAwesome
                        name="image"
                        size={40}
                        color={isDarkMode ? '#9ca3af' : '#6b7280'}
                    />
                    <Text className={`mt-2 ${textStyle.secondary}`}>
                        {t('roomTypeCard.noImage', 'No image available')}
                    </Text>
                </View>
            );
        }

        return (
            <Image
                className="w-full rounded-lg mb-4"
                source={{ uri: roomData.image.imageUrl }}
                style={{ height: IMAGE_HEIGHT }}
                resizeMode="cover"
                onError={handleImageError}
            />
        );
    };

    // Don't render if no room data
    if (!roomData) {
        return null;
    }

    return (
        <>
            <View
                className="mt-6 rounded-lg border"
                style={[SHADOW_CONFIG, containerStyle]}
            >
                <View className="p-4">
                    {/* Image */}
                    {renderImage()}

                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-4">
                        <Text className={`text-2xl font-bold flex-1 ${textStyle.primary}`}>
                            {roomData.typeName}
                        </Text>

                        {/* Availability Badge */}
                        <View
                            className={`px-2 py-1 rounded-full ml-2 ${isRoomAvailable
                                ? 'bg-green-100'
                                : 'bg-red-100'
                                }`}
                        >
                            <Text
                                className={`text-xs font-medium ${isRoomAvailable
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                    }`}
                            >
                                {isRoomAvailable
                                    ? t('roomTypeCard.available', 'Available')
                                    : t('roomTypeCard.unavailable', 'Full')
                                }
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className={`h-px mb-4 ${textStyle.divider}`} />

                    {/* Price and Guests */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-orange-500 font-semibold text-xl">
                            {formatAmount(roomData.price)}/ {t('roomTypeCard.month')}
                        </Text>

                        <View className="flex-row items-center">
                            <Text className={`font-semibold text-lg mr-2 ${textStyle.secondary}`}>
                                {t('roomTypeCard.guests')}:
                            </Text>
                            <Text className={`text-lg mr-2 ${textStyle.secondary}`}>
                                {roomData.peopleNumber}
                            </Text>
                            <FontAwesome
                                name="user"
                                size={18}
                                color={isDarkMode ? '#d1d5db' : '#6b7280'}
                            />
                        </View>
                    </View>

                    {/* Room Details */}
                    <View className="mb-4 space-y-3">
                        {/* Acreage */}
                        <DetailRow
                            label={t('roomTypeCard.acreage')}
                            value={`${roomData.roomSize}m²`}
                            textStyle={textStyle}
                        />

                        {/* Available Rooms */}
                        <DetailRow
                            label={t('roomTypeCard.availableRooms')}
                            value={roomData.availableRoom}
                            textStyle={textStyle}
                            valueColor={isRoomAvailable ? 'text-green-600' : 'text-red-600'}
                        />

                        {/* Furniture */}
                        <View className="flex-row">
                            <Text className={`font-semibold text-base ${textStyle.secondary} min-w-20`}>
                                {t('roomTypeCard.furniture')}:{' '}
                            </Text>
                            <Text className={`text-base flex-1 ${textStyle.secondary}`}>
                                {facilitiesText}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className={`h-px mb-4 ${textStyle.divider}`} />

                    {/* Action Buttons */}
                    <View className="flex-row justify-between items-center gap-3">
                        <Button
                            onPress={handleDeposit}
                            size="lg"
                            className='flex-1'
                            disabled={!isRoomAvailable || isDepositLoading}
                            loading={isDepositLoading}
                        >
                            {t('roomTypeCard.deposit')}
                        </Button>

                        <Button
                            size="lg"
                            className="bg-red-400"
                            onPress={handleMakeAppointment}
                            disabled={!isRoomAvailable}
                        >
                            {t('createAppointment.buttonText')}
                        </Button>
                    </View>

                    {/* Room unavailable message */}
                    {!isRoomAvailable && (
                        <Text className="text-center text-red-500 text-sm mt-2">
                            {t('roomTypeCard.roomUnavailable', 'This room type is currently full')}
                        </Text>
                    )}
                </View>
            </View>

            {/* Login Warning Modal */}
            <ConfirmModal
                confirmText={t('common.goToLogin', 'Go to Login')}
                visible={loginWarningVisible}
                message={t('auth.loginRequired', 'You must login before creating an appointment')}
                onConfirm={handleGoToLogin}
                title={t('common.warning', 'Warning')}
                onClose={handleToggleLoginWarning}
                warningMode
            />
        </>
    );
};

// Helper component for detail rows
const DetailRow = ({ label, value, textStyle, valueColor }) => (
    <View className="flex-row">
        <Text className={`font-semibold text-base ${textStyle.secondary} min-w-20`}>
            {label}:{' '}
        </Text>
        <Text className={`text-base ${valueColor || textStyle.secondary}`}>
            {value}
        </Text>
    </View>
);

export default React.memo(RoomTypeCard);