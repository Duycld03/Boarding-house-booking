import axios from '../axios.config';

export const getMyReport = (filterValue = {}, paginationOptions = {}) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get(`/auth/reports`, { params });
};
