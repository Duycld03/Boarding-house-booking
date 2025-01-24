import axios from './axios.config';

export const getReviewReports = () => {
  return axios.get('/admin/reviewreports');
};
