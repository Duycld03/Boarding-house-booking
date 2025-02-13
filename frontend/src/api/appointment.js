import axios from './axios.config';


export const getAppointmentOfUser = () => {
    return axios.get('/auth/appointment/user')
}


export const updateAppointmentStatus = (id, data) => {
    return axios.put(`/auth/appointment/update-status/${id}`, data);
};
