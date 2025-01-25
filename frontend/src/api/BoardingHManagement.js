import axios from './axios.config';

export const getAllBoardingHDB = () => {
    return axios.get('/admin/boardinghouse');
};
