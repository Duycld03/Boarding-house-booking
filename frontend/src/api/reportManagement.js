import axios from "./axios.config";

export const getReviewReports = () => {
  return axios.get("/dashboard/reviewreports");
};
export const deleteReviewReport = (reviewReportId) => {
  return axios.delete(`/dashboard/reviewreports/${reviewReportId}`);
};
export const updateReportStatus = (reviewReportId, status) => {
  return axios.put(`/dashboard/reports/${reviewReportId}/status`, { status });
};