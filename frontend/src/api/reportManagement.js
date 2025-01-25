import axios from "./axios.config";

export const getReviewReports = () => {
  return axios.get("/dashboard/review-reports");
};
export const deleteReviewReport = (reviewReportId) => {
  return axios.delete(`/dashboard/review-reports/${reviewReportId}`);
};
