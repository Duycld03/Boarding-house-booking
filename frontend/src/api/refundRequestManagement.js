import axios from "./axios.config";

export const getRefundRequests = () => {
  return axios.get("auth/refund-requests");
};
