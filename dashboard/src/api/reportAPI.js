import axios from "./axios.config";

export const getReviewReports = () => {
  return axios.get("/dashboard/review-reports");
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
  return axios.get("/dashboard/boarding-house-reports");
};

export const createReport = (data) => {
  return axios.post("auth/reports", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const checkReportExist = (reviewIds, boardingHouseId) => {
  return axios.get(`/auth/reports/exist`, {
    params: { reviewIds, boardingHouseId },
  });
};
export const getReportReviewDetail = (reportId) => {
  return axios.get(`/dashboard/reportReview/${reportId}`);
};

export const getOwnReportReviewDetail = (reportId) => {
  return axios.get(`/auth/reports/${reportId}`);
};
