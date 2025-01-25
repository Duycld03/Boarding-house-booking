import axios from './axios.config';

export const getReviewReports = () => {
  return axios.get('/dashboard/review-reports');
};
export const deleteReport = (reportId) => {
  return axios.delete(`/dashboard/reports/${reportId}`);
};
export const sendReplyByEmail = (reportId, data) => {
  return axios.put(`/dashboard/reports/${reportId}/send-email`, data);
};
