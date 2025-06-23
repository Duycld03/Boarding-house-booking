import axios from './axios.config';



export const getAppointmentOfUser = (paginationOptions = {}) => {
    const params = {
        ...paginationOptions,
    };
    return axios.get('/auth/appointment/user', { params })
}

export const updateAppointmentStatus = (id, data) => {
    return axios.put(`/auth/appointment/update-status/${id}`, data);
};

export const getOwnerAppointmentById = (id) => {
    return axios.get(`/appointment/owner/${id}`)
}

export const createAppointment = (value) => {
    return axios.post(`/auth/appointment/create-appointment/`, value)
}