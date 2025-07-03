import React from 'react';
import { Text, Button, Line } from "@/components/ui";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import formatAmount from '@/utils/formatAmount';
import i18next from 'i18next';

import convertMonthYear from '@/utils/coverMonthYear';
import { useTranslation } from 'react-i18next';


// Status colors mapping
const statusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-900",
    paid: "bg-green-100 dark:bg-green-900",
    overdue: "bg-red-100 dark:bg-red-900",
    cancelled: "bg-gray-100 dark:bg-gray-900",
    failed: "bg-gray-100 dark:bg-gray-900"
};

// Payment method icons using Expo icons


function UserPaymentCard({ count, payment, isDarkMode, themedClasses, onPressDetails, onPressPay }) {
    // Extract data from payment object based on the column structure
    const boardingHouseName = payment?.paymentBillId?.roomId?.boardingHouseId?.name || 'N/A';
    const roomNumber = payment?.paymentBillId?.roomId?.roomNumber || 'N/A';
    const status = payment?.status.toLowerCase() || 'pending';
    const paymentAmount = payment?.paymentAmount || 0;
    const paymentMethod = payment?.paymentMethod || 'cash';
    const month = payment?.paymentBillId?.month;
    const year = payment?.paymentBillId?.year;
    const currentLanguage = i18next.language || 'en';
    const { t } = useTranslation('myRentPayment');




    // Get status color classes
    const getStatusClasses = (status) => {
        return statusColors[status] || statusColors.pending;
    };

    return (
        <TouchableOpacity
            className={`mx-4 mb-4 rounded-xl shadow-sm ${themedClasses('bg-white', 'bg-gray-800')} ${themedClasses('border border-gray-200', 'border-gray-700')}`}
            activeOpacity={0.7}
        >
            {/* Header Section */}
            <View className="p-4">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text
                            variant='h4'
                            weight='semibold'
                        >
                            #{count}.
                            {boardingHouseName}
                        </Text>
                        <Text
                            className={`text-sm mt-1 ${themedClasses('text-gray-500', 'text-gray-400')}`}
                        >
                            {t('paymentCard.room')}: {roomNumber}
                        </Text>
                    </View>

                    {/* Status Badge */}
                    <View className={`px-3 py-1 rounded-full ${getStatusClasses(status)}`}>
                        <Text
                            variant='label'
                            weight='medium'
                            //add style color follow status
                            style={{
                                color: status === 'overdue' ? '#F97316' :
                                    status === 'paid' ? '#10B981' :
                                        status === 'pending' ? '#F59E0B' :
                                            status === 'cancelled' ? '#6B7280' :
                                                status === 'failed' ? '#EF4444' : '#6B7280'
                            }} className="capitalize">
                            {t(`paymentCard.status.${status}`) || status}
                        </Text>
                    </View>
                </View>
            </View >
            <Line
                thickness={2}
            />

            {/* Payment Details Section */}
            < View className="p-4" >
                {/* Amount */}
                <View View className="flex-row justify-between items-center mb-3" >
                    <Text
                        variant='label'
                        weight='medium'
                        className={`${themedClasses('text-gray-600', 'text-gray-300')}`}
                    >
                        {t('paymentCard.totalPayment')}
                    </Text>
                    <Text
                        variant='body'
                        weight='bold'
                        style={{ color: isDarkMode ? '#F59E0B' : '#F97316' }}
                    >
                        {formatAmount(paymentAmount, currentLanguage)}
                    </Text>
                </View >

                {/* Payment Method */}
                <View View className="flex-row justify-between items-center mb-3" >
                    <Text
                        variant='label'
                        weight='medium'
                    >
                        {t('paymentCard.paymentMethodTitle')}
                    </Text>
                    <View className="flex-row items-center">
                        <Text
                            variant='label'
                            weight='bold'
                            className={`capitalize`}
                        >

                            {paymentMethod}
                        </Text>
                    </View>
                </View >

                {/* Month's Rent */}
                <View View className="flex-row justify-between items-center mb-4" >
                    <Text
                        variant='label'
                        weight='medium'
                        className={`capitalize`}
                    >
                        {t('paymentCard.monthRent')}
                    </Text>
                    <Text
                        variant='label'
                        weight='medium'
                    >
                        {convertMonthYear(month, year, currentLanguage)}
                    </Text>
                </View >

                {/* Action Buttons */}
                <View className={`flex-row gap-3 ${status === 'pending' ? 'space-x-3' : ''}`}>

                    <Button
                        className="flex-1"
                        size="lg"
                        onPress={() => onPressDetails(payment)}
                    >
                        <Text
                            variant="body"
                            style={{ color: 'white' }}
                        >
                            {t('paymentCard.viewDetails')}
                        </Text>
                    </Button>
                </View>
            </View >

            {status === 'overdue' && (
                <View className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-b-xl">
                    <Text className="text-red-600 dark:text-red-400">
                        ⚠️ {t('paymentCard.overduePayment')}
                    </Text>
                </View>
            )}
        </TouchableOpacity >
    );
}

export default UserPaymentCard;