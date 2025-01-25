import axios from './axios.config';

export const getReviewReports = () => {
export const sendReportReplyByEmail = (reviewReportId, data) => {
  return axios.put(
    `/dashboard/review-reports/${reviewReportId}/send-email`,
    data
  );
};
  return axios.get("/dashboard/reviewreports");
};
export const deleteReviewReport = (reviewReportId) => {
  return axios.delete(`/dashboard/reviewreports/${reviewReportId}`);
};

