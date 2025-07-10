import axios from './axios.config';

export const getStaff = (params = {}) => {
  return axios.get('/owner/staff', { params });
};
