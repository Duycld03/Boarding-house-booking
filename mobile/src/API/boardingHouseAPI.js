import axios from './axios.config';

export const getAllBHHome = () => {
    return axios.get('/boardinghouse');
};