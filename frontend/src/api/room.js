import axios from './axios.config';


export const getRoomsByRoomType = (roomTypeId) => {
    return axios.get(`room/room-type/${roomTypeId}`);
};
