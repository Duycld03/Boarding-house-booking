import axios from '../axios.config';

export const getBoardingHouseDetail = (id) => {
    return axios.get(`/boardinghouse/${id}`);
};