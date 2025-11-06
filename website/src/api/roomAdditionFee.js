import axios from './axios.config';

export const getRoomAdditionFees = () => {
    return axios.get('/staff/room-addition-fee');
};

export const createRoomAdditionFee = (data) => {
    return axios.post('/staff/room-addition-fee', data);
};

export const updateRoomAdditionFee = (id, data) => {
    return axios.put(`/staff/room-addition-fee/${id}`, data);
};

export const deleteRoomAdditionFee = (id) => {
    return axios.delete(`/staff/room-addition-fee/${id}`);
};

export const getRoomAdditionFeesByRoomId = (roomId, paginationOptions = {}, month, year) => {
    return axios.get(`/staff/room-addition-fee/${roomId}`, { params: { ...paginationOptions, month, year } });
};