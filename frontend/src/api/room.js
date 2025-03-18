import axios from './axios.config';


export const getRoomsByRoomType = (roomTypeId) => {
    return axios.get(`room/room-type/${roomTypeId}`);
};

export const getRoomsByBoardingHouse = (boardingHouseId) => {
    return axios.get(`owner/room/boarding-house/${boardingHouseId}`);
}