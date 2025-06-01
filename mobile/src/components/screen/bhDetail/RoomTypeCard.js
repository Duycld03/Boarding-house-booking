import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import formatAmount from '@/utils/formatAmount';
// import CreateAppointmentForm from '../../pages/common/BoardingHouseDetail/CreateAppointmentForm';
// import { getRoomsByRoomType } from '../../api/room';
import { useCurrentUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
// import DepositPopup from './DepositPopup';
import userRoles from '@/constants/userRole';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';

const RoomTypeCard = ({ roomData, boardingHouse }) => {
    const { hasRole } = useCurrentUser();
    const isOwner = hasRole(userRoles.owner);
    const { isDarkMode } = useTheme();
    const { t } = useTranslation('boardingHouseDetail');
    const navigation = useNavigation();

    const [listRoomData, setListRoomData] = useState([]);
    const [depositPopupVisible, setDepositPopupVisible] = useState(false);

    // const fetchRoomByRoomTypeId = async () => {
    //   try {
    //     const res = await getRoomsByRoomType(
    //       roomData?._id,
    //       roomData?.boardingHouseId?._id
    //     );
    //     if (res) {
    //       setListRoomData(res);
    //     }
    //   } catch (error) {
    //     toast.error(t('roomTypeCard.fetchError') + error.message);
    //   }
    // };

    const handleOpen = () => {
        // if (!isLogin) {
        //     Alert.alert(
        //         t('roomTypeCard.loginRequired'),
        //         t('roomTypeCard.loginToDeposit'),
        //         [
        //             {
        //                 text: t('roomTypeCard.cancel'),
        //                 style: 'cancel',
        //             },
        //             {
        //                 text: t('roomTypeCard.login'),
        //                 onPress: () => navigation.navigate('Login'),
        //             },
        //         ]
        //     );
        //     return;
        // }
        setDepositPopupVisible(true);
    };

    // useEffect(() => {
    //   fetchRoomByRoomTypeId();
    // }, []);

    return (
        <>
            <View
                className={`mt-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                    }`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                {/* Content Container */}
                <View className="p-4">
                    {/* Image */}
                    <Image
                        className="w-full h-64 rounded-lg mb-4"
                        source={{ uri: roomData?.image?.imageUrl }}
                        resizeMode="cover"
                    />

                    {/* Title */}
                    <Text
                        className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}
                    >
                        {roomData?.typeName}
                    </Text>

                    {/* Divider */}
                    <View
                        className={`h-px mb-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                    />

                    {/* Price and Guests */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-orange-500 font-semibold text-xl">
                            {formatAmount(roomData?.price)}/ {t('roomTypeCard.month')}
                        </Text>

                        <View className="flex-row items-center">
                            <Text
                                className={`font-semibold text-lg mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {t('roomTypeCard.guests')}:
                            </Text>
                            <Text
                                className={`text-lg mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {roomData?.peopleNumber}x
                            </Text>
                            <FontAwesome
                                name="user"
                                size={18}
                                color={isDarkMode ? '#d1d5db' : '#6b7280'}
                            />
                        </View>
                    </View>

                    {/* Room Details */}
                    <View className="mb-4">
                        {/* Acreage */}
                        <View className="flex-row mb-3">
                            <Text
                                className={`font-semibold text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {t('roomTypeCard.acreage')}:{' '}
                            </Text>
                            <Text
                                className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {roomData?.roomSize}m²
                            </Text>
                        </View>

                        {/* Furniture */}
                        <View className="flex-row flex-wrap mb-3">
                            <Text
                                className={`font-semibold text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {t('roomTypeCard.furniture')}:{' '}
                            </Text>
                            <Text
                                className={`text-lg flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {roomData?.facilities?.map((item) => item.name).join(', ')}
                            </Text>
                        </View>

                        {/* Available Rooms */}
                        <View className="flex-row">
                            <Text
                                className={`font-semibold text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {t('roomTypeCard.availableRooms')}:{' '}
                            </Text>
                            <Text
                                className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {roomData?.availableRoom}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View
                        className={`h-px mb-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                    />

                    {/* Action Buttons */}
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity
                            className={`py-3 px-6 rounded-xl ${isOwner || roomData?.availableRoom === 0
                                ? isDarkMode
                                    ? 'bg-gray-700'
                                    : 'bg-gray-400'
                                : 'bg-blue-500'
                                }`}
                            onPress={handleOpen}
                            disabled={isOwner || roomData?.availableRoom === 0}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                {t('roomTypeCard.deposit')}
                            </Text>
                        </TouchableOpacity>

                        {/* CreateAppointmentForm component would go here */}
                        {/* <CreateAppointmentForm
              listRoomData={listRoomData}
              ownerId={roomData?.boardingHouseId?.ownerId}
              isDarkMode={isDarkMode}
            /> */}
                    </View>
                </View>
            </View>

            {/* Deposit Popup */}
            {/* <DepositPopup
        visible={depositPopupVisible}
        toggleVisible={setDepositPopupVisible}
        roomData={roomData}
        listRoomData={listRoomData}
        boardingHouse={boardingHouse}
        isDarkMode={isDarkMode}
      /> */}
        </>
    );
};

export default RoomTypeCard;