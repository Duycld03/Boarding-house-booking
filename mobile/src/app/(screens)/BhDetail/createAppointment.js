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
import { getRoomsByRoomType } from "@/API/roomAPI";
import { FontAwesome5 } from '@expo/vector-icons'
import userRoles from '@/constants/userRole';
import { useNotification } from '@/context/NotificationProvider';

import {
    getOwnerAppointmentById,
    createAppointment,
    getAppointmentOfUser,
} from '../../../API/appointmentAPI';
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

    // Validation error state
    const [errors, setErrors] = useState({
        room: '',
        appointmentDate: '',
        note: ''
    });

    const { isLogin, hasRole } = useCurrentUser();
    const isOwner = hasRole(userRoles.owner);

    // Modal state
    const [showRoomPicker, setShowRoomPicker] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Validation functions
    const validateRoom = (roomId) => {
        if (!roomId || roomId.trim() === '') {
            return t('createAppointment.validation.roomRequired') || 'Please select a room';
        }
        return '';
    };

    const validateAppointmentDate = (date) => {
        if (!date) {
            return t('createAppointment.validation.dateRequired') || 'Please select appointment date';
        }

        const selectedDateTime = dayjs(date);
        const now = dayjs();

        // Check if date is in the past
        if (selectedDateTime.isBefore(now)) {
            return t('createAppointment.validation.pastDate') || 'Cannot select past date';
        }

        // Check if time is within allowed hours (6 AM - 6 PM)
        const hour = selectedDateTime.hour();
        if (hour < 6 || hour >= 18) {
            return t('createAppointment.validation.invalidTime') || 'Please select time between 6:00 AM and 6:00 PM';
        }

        // Check if date is disabled
        if (isDisabledDate(date)) {
            return t('createAppointment.validation.dateUnavailable') || 'Selected date is not available';
        }

        // Check if time is disabled
        if (isDisabledTime(date)) {
            return t('createAppointment.validation.timeUnavailable') || 'Selected time is not available';
        }

        return '';
    };

    const validateNote = (noteText) => {
        // Note is optional, but if provided, check length
        if (noteText && noteText.length > 500) {
            return t('createAppointment.validation.noteTooLong') || 'Note cannot exceed 500 characters';
        }
        return '';
    };

    // Real-time validation
    const handleRoomChange = (roomId) => {
        setSelectedRoomId(roomId);
        const error = validateRoom(roomId);
        setErrors(prev => ({ ...prev, room: error }));
    };

    const handleDateChange = (date) => {
        setAppointmentDate(date);
        const error = validateAppointmentDate(date);
        setErrors(prev => ({ ...prev, appointmentDate: error }));
    };

    const handleNoteChange = (text) => {
        setNote(text);
        const error = validateNote(text);
        setErrors(prev => ({ ...prev, note: error }));
    };

    // Validate all fields
    const validateAllFields = () => {
        const roomError = validateRoom(selectedRoomId);
        const dateError = validateAppointmentDate(appointmentDate);
        const noteError = validateNote(note);

        setErrors({
            room: roomError,
            appointmentDate: dateError,
            note: noteError
        });

        return !roomError && !dateError && !noteError;
    };

    // Reset form function
    const resetForm = () => {
        setSelectedRoomId('');
        setAppointmentDate(null);
        setNote('');
        setErrors({
            room: '',
            appointmentDate: '',
            note: ''
        });
    };

    // Fixed: Added function to fetch rooms data
    const fetchRoomByRoomTypeId = async () => {
        try {
            const res = await getRoomsByRoomType(roomTypeId);
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
            handleDateChange(selectedDateTime);
        }
    };

    const handleCreateAppointment = async () => {
        // Validate all fields before submission
        if (!validateAllFields()) {
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
                    showError(t('createAppointment.sameRoomError'))
                    return;
                }
            }

            const isWithin30Minutes = (existingDate, newDate) => {
                const diff = Math.abs(new Date(existingDate) - new Date(newDate));
                return diff <= 30 * 60 * 1000;
            };

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
                    showError(t('createAppointment.timeConflictError'))
                    return;
                }
            }

            await createAppointment(appointmentData).then(() => {
                showSuccess('Create appointment success')
                resetForm();
                router.back()
            })
        } catch (error) {
            console.log('Error creating appointment:', error);
            Alert.alert('Error', t('createAppointment.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStayHere = () => {
        setShowSuccessModal(false);
        router.back();
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
                        {t('createAppointment.selectRoom')} <Text
                            style={{ color: 'red' }}
                        >*</Text>
                    </Text>
                    <TouchableOpacity
                        className={`border rounded-lg p-4 ${isDarkMode
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-300 bg-white'
                            } ${isOwner ? 'opacity-50' : ''} ${errors.room ? 'border-red-500' : ''}`}
                        onPress={() => setShowRoomPicker(true)}
                        disabled={isOwner}
                    >
                        <Text className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-black'} ${!selectedRoomId ? 'opacity-60' : ''}`}>
                            {selectedRoomId
                                ? roomData.find(room => room._id === selectedRoomId)?.roomNumber
                                : t('createAppointment.roomPlaceholder')}
                        </Text>
                    </TouchableOpacity>
                    {errors.room ? (
                        <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                            {errors.room}
                        </Text>
                    ) : null}

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
                                <View className={`flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                                            className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${selectedRoomId === room._id
                                                ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                : ''}`}
                                            onPress={() => {
                                                handleRoomChange(room._id);
                                                setShowRoomPicker(false);
                                            }}
                                        >
                                            <Text className={`text-base ${selectedRoomId === room._id ? 'font-semibold' : ''} ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                        <Text
                            style={{ color: 'red' }}
                        >*</Text>
                    </Text>
                    <CustomDatePicker
                        value={appointmentDate}
                        onChange={handleDateTimeChange}
                        mode="datetime"
                        minDate={getMinDate()}
                        placeholder={t('createAppointment.datePlaceHolder')}
                        format={(date) => dayjs(date).format('YYYY-MM-DD HH:mm')}
                        disabled={isOwner}
                        error={errors.appointmentDate}
                    />

                </View>

                {/* Note Input */}
                <View className="mb-5">
                    <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {t('createAppointment.note')}
                        <Text className="text-gray-500 text-sm font-normal ml-2">
                            ({note.length}/500)
                        </Text>
                    </Text>
                    <Input
                        value={note}
                        onChangeText={handleNoteChange}
                        placeholder={t('createAppointment.notePlaceholder')}
                        multiline
                        numberOfLines={4}
                        className={`min-h-[100px] text-top border rounded-lg p-3 ${isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-gray-200'
                            : 'border-gray-300 bg-white text-black'
                            } ${errors.note ? 'border-red-500' : ''}`}
                        style={{ textAlignVertical: 'top' }}
                        error={errors.note}
                    />
                    {errors.note ? (
                        <Text className="text-red-500 text-sm mt-1">{errors.note}</Text>
                    ) : null}
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
                    {submitting ? t('createAppointment.submitting') || 'Creating...' : t('createAppointment.submit')}
                </Button>

                {/* Success Confirmation Modal */}
                <ConfirmModal
                    visible={showSuccessModal}
                    title={t('createAppointment.successTitle')}
                    message={t('createAppointment.successMessage')}
                    confirmText={t('createAppointment.goToMyAppointments')}
                    cancelText={t('createAppointment.goBack')}
                    onConfirm={() => handleGoToMyAppointment()}
                    onClose={handleStayHere}
                />

            </View>
        </ScrollContainer>
    );
}

export default CreateAppointment;