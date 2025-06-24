import axios from './axios.config';


export const getRoomsByRoomType = (roomTypeId) => {
    return axios.get(`room/room-type/${roomTypeId}`);
};

export const getRoomsByBoardingHouse = (boardingHouseId, paginationOptions = {}) => {
    const params = {
        ...paginationOptions,
    };

    return axios.get(`/staff/room/boarding-house/${boardingHouseId}`, { params });
}