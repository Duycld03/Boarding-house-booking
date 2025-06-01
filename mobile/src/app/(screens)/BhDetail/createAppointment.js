import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ScrollContainer } from '@/components/layout';
import { Text, Button, Input } from '@/components/ui';
import { CustomDatePicker, FormField } from '@/components/form';
import { useTheme } from '@/context/ThemeProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ConfirmModal } from '@/components/feedback'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useCurrentUser } from '../../../context/userContext';
import { getRoomsByRoomType } from "@/API/room";
import { FontAwesome5 } from '@expo/vector-icons'
import userRoles from '@/constants/userRole';
import { useNotification } from '@/context/NotificationProvider';

import {
    getOwnerAppointmentById,
    createAppointment,
    getAppointmentOfUser,
} from '../../../API/appointment';
import { BackHeader } from '@/components/navigation/CustomHeader';

dayjs.extend(utc);
dayjs.extend(timezone);

function CreateAppointment() {
    const { t } = useTranslation('boardingHouseDetail');
    const { isDarkMode } = useTheme();
    const { boardingHouseId, roomTypeId, ownerId } = useLocalSearchParams();
    const router = useRouter();

    const { showSuccess, showError } = useNotification();

    const [roomData, setRoomData] = useState([]);


    const [ownerAppointment, setOwnerAppointment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userAppointment, setUserAppointment] = useState([]);

    // Form state
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(null);
    const [note, setNote] = useState('');

    const { isLogin, hasRole } = useCurrentUser();
    const isOwner = hasRole(userRoles.owner);

    // Modal state
    const [showRoomPicker, setShowRoomPicker] = useState(false);



    // Fixed: Added function to fetch rooms data
    const fetchRoomByRoomTypeId = async () => {
        try {
            const res = await getRoomsByRoomType(
                roomTypeId,
            );
            setRoomData(res)
        } catch (error) {
            // toast.error(t("roomTypeCard.fetchError") + error.message);
        }
    };

    const fetchOwnerAppointment = async () => {
        setLoading(true);
        try {
            const res = await getOwnerAppointmentById(ownerId);
            if (res) {
                setOwnerAppointment(
                    res.map((appt) =>
                        dayjs.utc(appt.appointmentDate).tz('Asia/Ho_Chi_Minh')
                    )
                );
            }
        } catch (error) {
            console.log('Error fetching owner appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataUserAppointment = async () => {
        setLoading(true);
        try {
            const res = await getAppointmentOfUser();
            setUserAppointment(res || []);
        } catch (error) {
            console.log('Error fetching user appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomByRoomTypeId()
        fetchOwnerAppointment();
        fetchDataUserAppointment();
    }, [isLogin, ownerId, roomTypeId]);

    const isDisabledDate = (date) => {
        if (!date) return false;

        const today = dayjs().tz('Asia/Ho_Chi_Minh').startOf('day');
        const selectedDay = dayjs(date).tz('Asia/Ho_Chi_Minh').startOf('day');

        if (selectedDay.isBefore(today) || selectedDay.isSame(today, 'day')) {
            return true;
        }

        const appointmentCount = ownerAppointment.filter((appt) =>
            appt.isSame(selectedDay, 'day')
        ).length;

        return appointmentCount >= 5;
    };

    const isDisabledTime = (date) => {
        if (!date) return false;

        const selectedDay = dayjs(date).startOf('day');
        const hour = dayjs(date).get('hour');

        const bookedHours = ownerAppointment
            .filter((appt) => appt.startOf('day').isSame(selectedDay, 'day'))
            .map((appt) => appt.get('hour'));

        return !(hour >= 6 && hour < 18 && !bookedHours.includes(hour));
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    };

    const handleDateTimeChange = (selectedDateTime) => {
        if (selectedDateTime) {
            setAppointmentDate(selectedDateTime);
        }
    };

    const handleCreateAppointment = async () => {
        // Validation
        if (!selectedRoomId) {
            showError('Please select room!')
            return;
        }

        if (!appointmentDate) {
            showError('Please select date!')
            return;
        }




        setSubmitting(true);

        try {
            const appointmentDateISO = dayjs(appointmentDate)
                .tz('Asia/Ho_Chi_Minh', true)
                .utc()
                .toISOString();

            const appointmentData = {
                roomId: selectedRoomId,
                appointmentDate: appointmentDateISO,
                note: note || '',
            };

            // Check for same room appointment
            if (userAppointment.length > 0) {
                const hasSameRoom = userAppointment.some(
                    (appt) =>
                        appt.roomId === appointmentData.roomId &&
                        (appt.status === 'pending' || appt.status === 'confirmed')
                );

                if (hasSameRoom) {
                    Alert.alert('Error', t('createAppointment.sameRoomError'));
                    return;
                }
            }

            const isWithin30Minutes = (existingDate, newDate) => {
                const diff = Math.abs(new Date(existingDate) - new Date(newDate));
                return diff <= 30 * 60 * 1000;
            };

            // Check for time conflict
            if (userAppointment.length > 0) {
                const hasConflict = userAppointment
                    .filter(
                        (appt) => appt.status === 'pending' || appt.status === 'confirmed'
                    )
                    .some((appt) =>
                        isWithin30Minutes(
                            appt.appointmentDate,
                            appointmentData.appointmentDate
                        )
                    );

                if (hasConflict) {
                    Alert.alert('Error', t('createAppointment.timeConflictError'));
                    return;
                }
            }

            await createAppointment(appointmentData);
            Alert.alert('Success', t('createAppointment.success'), [
                {
                    text: 'OK',
                    onPress: () => router.push('/my-appointment'),
                },
            ]);
        } catch (error) {
            console.log('Error creating appointment:', error);
            Alert.alert('Error', t('createAppointment.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ScrollContainer>
                <View className="flex-1 justify-center items-center pt-12">
                    <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
                </View>
            </ScrollContainer>
        );
    }

    return (
        <ScrollContainer>
            <BackHeader
                title={t('createAppointment.modalTitle')}
                backIcon={
                    <FontAwesome5
                        name="chevron-left"
                        size={18}
                        color={isDarkMode ? '#fff' : '#333'}
                    />
                }
            />
            <View className="flex-1 p-5">


                {/* Room Selection */}
                <View className="mb-5">
                    <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {t('createAppointment.selectRoom')}
                    </Text>
                    <TouchableOpacity
                        className={`border rounded-lg p-4 ${isDarkMode
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-300 bg-white'
                            } ${isOwner ? 'opacity-50' : ''}`}
                        onPress={() => setShowRoomPicker(true)}
                        disabled={isOwner}
                    >
                        <Text className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>
                            {selectedRoomId
                                ? roomData.find(room => room._id === selectedRoomId)?.roomNumber
                                : t('createAppointment.roomPlaceholder')}
                        </Text>
                    </TouchableOpacity>

                    <Modal
                        visible={showRoomPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowRoomPicker(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 bg-black/50 justify-end"
                            activeOpacity={1}
                            onPress={() => setShowRoomPicker(false)}
                        >
                            <View className={`rounded-t-3xl max-h-[80%] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <View className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                    <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        {t('createAppointment.selectRoom')}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowRoomPicker(false)}
                                        className="p-1"
                                    >
                                        <Text className={`text-xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                            ✕
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView className="p-4">
                                    {roomData.map((room) => (
                                        <TouchableOpacity
                                            key={room._id}
                                            className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                } ${selectedRoomId === room._id
                                                    ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                    : ''
                                                }`}
                                            onPress={() => {
                                                setSelectedRoomId(room._id);
                                                setShowRoomPicker(false);
                                            }}
                                        >
                                            <Text className={`text-base ${selectedRoomId === room._id
                                                ? 'font-semibold'
                                                : ''
                                                } ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                                {room.roomNumber}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>

                {/* Date Selection */}
                <View className="mb-5">
                    <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {t('createAppointment.dateTime')}
                    </Text>
                    <CustomDatePicker
                        value={appointmentDate}
                        onChange={handleDateTimeChange}
                        mode="datetime"
                        minDate={getMinDate()}
                        placeholder={t('createAppointment.datePlaceHolder')}
                        format={(date) => dayjs(date).format('YYYY-MM-DD HH:mm')}
                        disabled={isOwner}
                    />
                </View>

                {/* Note Input */}
                <View className="mb-5">
                    <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {t('createAppointment.note')}
                    </Text>
                    <Input
                        value={note}
                        onChangeText={setNote}
                        placeholder={t('createAppointment.notePlaceholder')}
                        multiline
                        numberOfLines={4}
                        className={`min-h-[100px] text-top border rounded-lg p-3 ${isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-gray-200'
                            : 'border-gray-300 bg-white text-black'
                            }`}
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

                {/* Submit Button */}

                <Button
                    onPress={handleCreateAppointment}
                    disabled={submitting || isOwner || roomData.length === 0}
                    className={`py-4 rounded-xl items-center mt-5 ${submitting || isOwner || roomData.length === 0
                        ? 'opacity-50'
                        : ''
                        } ${isDarkMode ? 'bg-red-600' : 'bg-red-500'}`}
                >

                    {t('createAppointment.submit')}
                </Button>

            </View>
        </ScrollContainer>
    );
}

export default CreateAppointment;