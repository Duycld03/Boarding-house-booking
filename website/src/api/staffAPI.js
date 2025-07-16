import axios from './axios.config';

export const getStaff = (params = {}) => {
  return axios.get('/owner/staff', { params });
};
export const addStaff = (data) => {
  return axios.post('/owner/addstaff', data);
};

export const deleteStaff = (staffId) => {
  return axios.delete(`/owner/staff/${staffId}`);
};

export const updateStaff = (staffId, data) => {
  return axios.put(`/owner/staff/${staffId}`, data);
};
