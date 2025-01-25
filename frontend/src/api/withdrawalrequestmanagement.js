import axios from './axios.config';

export const getWithdrawRequests = () => {
  return axios.get('/admin/withdrawRequests');
};
