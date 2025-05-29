import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
    ScrollView,
    Pressable,
    Linking,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeProvider';

interface OwnerData {
    fullname: string;
    email: string;
    phoneNumber: string;
    gender: string;
    avatarImage?: {
        url: string;
    };
}

interface OwnerInfoProps {
    ownerData: OwnerData;
}

const { width: screenWidth } = Dimensions.get('window');

const OwnerInfo: React.FC<OwnerInfoProps> = ({ ownerData }) => {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation('boardingHouseDetail');
    const { isDarkMode } = useTheme();

    if (!ownerData) return null;

    const handleCall = () => {
        Linking.openURL(`tel:${ownerData.phoneNumber}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${ownerData.email}`);
    };

    const getGenderIcon = (gender: string) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return '👨';
            case 'female':
                return '👩';
            default:
                return '👤';
        }
    };

    const renderAvatar = (size: number) => {
        const sizeClass = size === 60 ? 'w-15 h-15' : 'w-32 h-32';
        const textSizeClass = size === 60 ? 'text-xl' : 'text-4xl';

        return (
            <View
                className={`${sizeClass} rounded-full overflow-hidden border-2 ${isDarkMode ? 'border-gray-600' : 'border-white'
                    }`}
                style={{
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: isDarkMode ? 0.5 : 0.25,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                {ownerData.avatarImage?.url ? (
                    <Image
                        source={{ uri: ownerData.avatarImage.url }}
                        className={`${sizeClass} rounded-full`}
                        resizeMode="cover"
                    />
                ) : (
                    <View className={`${sizeClass} rounded-full justify-center items-center ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                        <Text className={`${textSizeClass} font-bold text-white`}>
                            {ownerData.fullname.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const InfoCard = ({ icon, label, value, onPress, color }) => (
        <TouchableOpacity
            className={`flex-row items-center p-4 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } ${onPress ? 'active:bg-opacity-70' : ''}`}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={{
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${color}`}
                style={{
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            >
                <Text className="text-lg">{icon}</Text>
            </View>
            <View className="flex-1">
                <Text className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {label}
                </Text>
                <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {value}
                </Text>
            </View>
            {onPress && (
                <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                    style={{
                        shadowColor: isDarkMode ? '#000' : '#000',
                        shadowOffset: {
                            width: 0,
                            height: 1,
                        },
                        shadowOpacity: 0.15,
                        shadowRadius: 2,
                        elevation: 1,
                    }}
                >
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        →
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <>
            {/* Simple Display - Avatar and Name only */}
            <View className="flex-row items-center py-2">
                {/* Clickable Avatar */}
                <TouchableOpacity
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                >
                    {ownerData.avatarImage?.url ? (
                        <Image
                            source={{ uri: ownerData.avatarImage.url }}
                            className="w-16 h-16 rounded-full border-2 border-white"
                            resizeMode="cover"

                        />
                    ) : (
                        <View
                            className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 justify-center items-center border-2 border-white"
                            style={{
                                shadowColor: isDarkMode ? '#000' : '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: isDarkMode ? 0.5 : 0.25,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <Text className="text-xl font-bold text-white">
                                {ownerData.fullname.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Clickable Name */}
                <TouchableOpacity
                    className="flex-1 ml-4"
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {ownerData.fullname}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View className="flex-1 justify-end">
                    <Pressable
                        className="absolute inset-0 bg-black/50"
                        onPress={() => setVisible(false)}
                    />

                    {/* Modal Content with Enhanced Shadow */}
                    <View
                        className={`rounded-t-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}
                        style={{
                            maxHeight: '85%',
                            shadowColor: isDarkMode ? '#000' : '#000',
                            shadowOffset: {
                                width: 0,
                                height: -8,
                            },
                            shadowOpacity: isDarkMode ? 0.6 : 0.25,
                            shadowRadius: 16,
                            elevation: 20,
                        }}
                    >
                        {/* Handle Bar */}
                        <View className="items-center py-3">
                            <View
                                className={`w-12 h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                                    }`}
                                style={{
                                    shadowColor: isDarkMode ? '#000' : '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 1,
                                    elevation: 1,
                                }}
                            />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header with Enhanced Avatar Shadow */}
                            <View className="items-center px-6 py-4">
                                {renderAvatar(128)}
                                <Text className={`text-2xl font-bold mt-4 mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {ownerData.fullname}
                                </Text>
                            </View>

                            {/* Info Cards with Enhanced Shadows */}
                            <View className="px-6 pb-6">
                                <InfoCard
                                    icon="📧"
                                    label={t('ownerInfo.email')}
                                    value={ownerData.email}
                                    onPress={handleEmail}
                                    color="bg-blue-100"
                                />

                                <InfoCard
                                    icon="📱"
                                    label={t('ownerInfo.phone')}
                                    value={ownerData.phoneNumber}
                                    onPress={handleCall}
                                    color="bg-green-100"
                                />

                                <InfoCard
                                    icon={getGenderIcon(ownerData.gender)}
                                    label={t('ownerInfo.gender')}
                                    value={t(`gender.${ownerData.gender.toLowerCase()}`)}
                                    color="bg-purple-100"
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default OwnerInfo;