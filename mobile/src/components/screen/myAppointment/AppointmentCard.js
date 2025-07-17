import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Line, Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/vi'; // Vietnamese locale
import 'dayjs/locale/en'; // English locale
import i18next from 'i18next';

import {
    Ionicons,
    MaterialIcons,
    FontAwesome5,
    Feather
} from '@expo/vector-icons';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

const AppointmentCard = ({ item, onCancel }) => {
    const { isDarkMode } = useTheme();
    const { themedClasses } = useThemedClasses();
    const { t } = useTranslation('myAppointment');


    const currentLanguage = i18next.language;

    const statusStyles = {
        pending: {
            bg: isDarkMode
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400',
            text: 'text-white',
            iconName: 'time',
            iconLibrary: Ionicons,
            iconColor: 'yellow',
            borderColor: isDarkMode ? 'border-amber-500/30' : 'border-amber-200'
        },
        accepted: {
            bg: isDarkMode
                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500'
                : 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400',
            text: 'text-white',
            iconName: 'checkmark-circle',
            iconLibrary: Ionicons,
            iconColor: 'orange',
            borderColor: isDarkMode ? 'border-blue-500/30' : 'border-blue-200'
        },
        rejected: {
            bg: isDarkMode
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-pink-500'
                : 'bg-gradient-to-r from-red-400 via-red-500 to-pink-400',
            text: 'text-white',
            iconName: 'close-circle',
            iconLibrary: Ionicons,
            iconColor: 'red', // red-800 : red-100
            borderColor: isDarkMode ? 'border-red-500/30' : 'border-red-200'
        },
        completed: {
            bg: isDarkMode
                ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500'
                : 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400',
            text: 'text-white',
            iconName: 'checkmark-done-circle',
            iconLibrary: Ionicons,
            iconColor: 'green',
            borderColor: isDarkMode ? 'border-green-500/30' : 'border-green-200'
        },
    };

    // Enhanced date formatting with proper locale handling
    const formatDate = (dateString) => {
        // Parse the date as UTC and convert to Vietnam timezone
        const date = dayjs.utc(dateString).tz('Asia/Ho_Chi_Minh');

        // Set locale based on current language
        const localizedDate = date.locale(currentLanguage === 'vi' ? 'vi' : 'en');

        // Format based on language
        if (currentLanguage === 'vi') {
            // Vietnamese format: "Ngày DD tháng MM, YYYY lúc HH:mm"
            return localizedDate.format('DD [tháng] MM, YYYY [lúc] HH:mm');
        } else {
            // English format: "MMM DD, YYYY at HH:mm"  
            return localizedDate.format('MMM DD, YYYY [at] HH:mm');
        }
    };

    // Alternative formatting function for more detailed localization
    const formatDateDetailed = (dateString) => {
        const date = dayjs.utc(dateString).tz('Asia/Ho_Chi_Minh');
        const localizedDate = date.locale(currentLanguage === 'vi' ? 'vi' : 'en');

        if (currentLanguage === 'vi') {
            // Vietnamese detailed format
            const dayName = localizedDate.format('dddd'); // Thứ hai, Thứ ba, etc.
            const dateFormat = localizedDate.format('DD [tháng] MM, YYYY');
            const timeFormat = localizedDate.format('HH:mm');
            return `${dayName}, ${dateFormat} lúc ${timeFormat}`;
        } else {
            // English detailed format
            return localizedDate.format('dddd, MMMM DD, YYYY [at] HH:mm');
        }
    };

    const statusStyle = statusStyles[item?.status?.toLowerCase()];
    const StatusIcon = statusStyle?.iconLibrary;

    return (
        <View
            className={`rounded-2xl mx-4 mb-4 ${themedClasses(
                'bg-white border border-gray-200',
                'bg-gray-800 border-white'
            )}`}
        >
            {/* Card Header */}
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-4">
                    {/* Status Badge */}
                    <View
                        className={`${statusStyle.bg} px-4 py-2 rounded-xl flex-row items-center`}
                    >
                        <StatusIcon
                            name={statusStyle.iconName}
                            size={18}
                            color={statusStyle.iconColor}
                            style={{ marginRight: 8 }}
                        />
                        <Text className={`${statusStyle.text} text-sm font-semibold`}>
                            {t(`status.${item.status?.toLowerCase()}`)}
                        </Text>
                    </View>

                    {/* Date Badge */}
                    <View className={`px-3 py-2 rounded-lg flex-row items-center ${themedClasses(
                        'bg-gray-50 border border-gray-200',
                        'bg-gray-700 border-gray-600'
                    )}`}>
                        <Ionicons
                            name="calendar"
                            size={16}
                            color={isDarkMode ? '#A78BFA' : '#8B5CF6'}
                            style={{ marginRight: 6 }}
                        />
                        <Text className={`text-sm font-medium ${themedClasses('text-gray-700', 'text-gray-200')}`}>
                            {formatDate(item.appointmentDate)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Card Content */}
            <View className="px-4 pb-4 space-y-4">
                {/* Owner Information */}
                <View className={`p-4 rounded-xl ${themedClasses(
                    'bg-blue-50 border border-blue-100',
                    'bg-blue-900/20 border-blue-800/50'
                )}`}>
                    <View className="flex-row items-center mb-2">
                        <View className={themedClasses(
                            'bg-blue-100 p-2 rounded-lg mr-3',
                            'bg-blue-800/30'
                        )}>
                            <Ionicons
                                name="person"
                                size={20}
                                color={isDarkMode ? '#93C5FD' : '#3B82F6'}
                            />
                        </View>
                        <Text className={`text-sm font-semibold ${themedClasses('text-blue-700', 'text-blue-300')}`}>
                            {t('owner').toUpperCase()}
                        </Text>
                    </View>
                    <Text className={`font-bold text-lg ${themedClasses('text-gray-900', 'text-white')}`}>
                        {item.ownerName}
                    </Text>
                </View>

                {/* Boarding House Information */}
                <View className={`p-4 rounded-xl ${themedClasses(
                    'bg-emerald-50 border border-emerald-100 ',
                    'bg-emerald-900/20 border-emerald-800/50'
                )}`}>
                    <View className="flex-row items-center mb-2">
                        <View className={`rounded-lg mr-3 ${themedClasses(
                            'bg-emerald-100 p-2',
                            'bg-emerald-800/30'
                        )}`}>
                            <FontAwesome5
                                name="home"
                                size={18}
                                color={isDarkMode ? '#86EFAC' : '#10B981'}
                            />
                        </View>
                        <Text className={`text-sm font-semibold ${themedClasses('text-emerald-700', 'text-emerald-300')}`}>
                            {t('boardingHouse').toUpperCase()}
                        </Text>
                    </View>
                    <Text className={`font-bold text-lg mb-3 ${themedClasses('text-gray-900', 'text-white')}`}>
                        {item.boardingHouseName}
                    </Text>

                    {/* Room Number */}
                    <View className="flex-row items-center">
                        <View className={`p-2 rounded-lg mr-3 ${themedClasses(
                            'bg-emerald-100',
                            'bg-emerald-800/30'
                        )}`}>
                            <MaterialIcons
                                name="meeting-room"
                                size={16}
                                color={isDarkMode ? '#86EFAC' : '#059669'}
                            />
                        </View>
                        <Text className={`text-sm font-medium ${themedClasses('text-emerald-600', 'text-emerald-400')}`}>
                            {t('roomNumber')}:
                        </Text>
                        <Text className={`font-bold ml-2 ${themedClasses('text-gray-800', 'text-gray-200')}`}>
                            #{item.roomNumber}
                        </Text>
                    </View>
                </View>

                {/* Note Section */}
                {item.note && (
                    <>
                        <View className={`p-4 rounded-xl ${themedClasses(
                            'bg-amber-50 border border-amber-100',
                            'bg-amber-900/20 border-amber-800/50'
                        )}`}>
                            <View className="flex-row items-center mb-2">
                                <View className={`rounded-lg mr-3 ${themedClasses(
                                    'bg-amber-100 p-2',
                                    'bg-amber-800/30'
                                )}`}>
                                    <Feather
                                        name="edit-3"
                                        size={18}
                                        color={isDarkMode ? '#FCD34D' : '#F59E0B'}
                                    />
                                </View>
                                <Text className={`text-sm font-semibold ${themedClasses('text-amber-700', 'text-amber-300')}`}>
                                    {t('note').toUpperCase()}
                                </Text>
                            </View>
                            <Text
                                className={`leading-5 ${themedClasses('text-gray-800', 'text-gray-200')}`}
                                numberOfLines={4}
                            >
                                {item.note}
                            </Text>
                        </View>
                    </>
                )}

                {/* Reason for Cancellation - New Section */}
                {item.status === 'rejected' && item.reasonForCancel && (
                    <View className={`p-4 rounded-xl ${themedClasses(
                        'bg-red-50 border border-red-100',
                        'bg-red-900/20 border-red-800/50'
                    )}`}>
                        <View className="flex-row items-center mb-2">
                            <View className={`rounded-lg mr-3 ${themedClasses(
                                'bg-red-100 p-2',
                                'bg-red-800/30'
                            )}`}>
                                <MaterialIcons
                                    name="cancel"
                                    size={18}
                                    color={isDarkMode ? '#FCA5A5' : '#EF4444'}
                                />
                            </View>
                            <Text className={`text-sm font-semibold ${themedClasses('text-red-700', 'text-red-300')}`}>
                                {t('reasonForCancel')}
                            </Text>
                        </View>
                        <Text
                            className={`leading-5 ${themedClasses('text-gray-800', 'text-gray-200')}`}
                            numberOfLines={4}
                        >
                            {item.reasonForCancel}
                        </Text>
                    </View>
                )}

                {/* Action Button */}
                {item.status === 'pending' && (
                    <>
                        <Button
                            onPress={() => onCancel(item)}
                            className={'bg-red-500'}
                            icon={<MaterialIcons
                                name="cancel"
                                size={24}
                                color="#ffffff"
                            />}
                        >
                            {t('cancelAppointment')}
                        </Button>
                    </>
                )}
            </View>
        </View>
    );
};

export default AppointmentCard;