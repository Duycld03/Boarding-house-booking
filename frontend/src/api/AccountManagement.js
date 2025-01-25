import axios from './axios.config';
export const getAllAccount = () => {
    return axios.get('/dashboard/account');
};
export const deleteAccount = (id) => {
    return axios.delete(`/dashboard/account/${id}`);
};
export const filterAccount = (filterValue) => {
    return axios.get(`/dashboard/account/filter`, {
        params: filterValue,
    });
};
