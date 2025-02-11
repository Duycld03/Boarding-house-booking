import axios from '../axios.config';

export const getBoardingHouseDetail = (id) => {
    return axios.get(`/boardinghouse/${id}`);
};

export const getRoomTypeByBhId = (id) => {
    return axios.get(`/boardinghouse/room-types/${id}`);
};
