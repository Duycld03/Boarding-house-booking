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
export const filterReviewReports = (filterValue) => {
  return axios.get(`/dashboard/reports/filter`, {
    params: filterValue,
  });
};
export const filterBHReports = (filterValue) => {
  return axios.get(`/dashboard/reports/filter/boarding-house`, {
    params: filterValue,
  });
};

export const getBHReports = () => {
  return axios.get('/dashboard/boarding-house-reports');
};
