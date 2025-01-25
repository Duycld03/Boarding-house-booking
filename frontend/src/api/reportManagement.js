import axios from './axios.config';

export const getReviewReports = () => {
  return axios.get('/admin/reviewreports');
};
export const deleteReviewReport = (reviewReportId) => {
  return axios.delete(`/admin/reviewreports/${reviewReportId}`);
};
