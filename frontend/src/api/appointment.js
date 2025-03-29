import axios from './axios.config';


export const getAppointmentOfUser = () => {
    return axios.get('/auth/appointment/user')
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
export const getAppointmentsByBoardingHouseId = (boardingHouseId) => {
    return axios.get(`/owner/${boardingHouseId}`);
};
export const getAppointmentDetailForOwner = (id) => {
    return axios.get(`/owner/appointment/${id}`);
};
export const acceptAppointment = (appointmentId, confirmOverlap = false) => {
    return axios.post(`/owner/appointments/accept/${appointmentId}`, { confirmOverlap });
};
export const rejectAppointment = (appointmentId) => {
    return axios.post(`/owner/appointments/reject/${appointmentId}`);
};