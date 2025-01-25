import axios from './axios.config';

export const getAllAccount = () => {
    return axios.get('/admin/account');
};

export const deleteAccount = (id) => {
    return axios.delete(`/admin/account/${id}`);
};


export const filterAccount = (filterValue) => {
    return axios.get(`/admin/account/filter`, {
        params: filterValue,
    });
};

