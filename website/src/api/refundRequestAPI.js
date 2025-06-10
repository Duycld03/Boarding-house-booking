import axios from "./axios.config";

export const getRefundRequests = () => {
  return axios.get("auth/refund-requests");
};
export const createRefundRequest = (data) => {
  return axios.post("auth/refund-requests", data);
};
