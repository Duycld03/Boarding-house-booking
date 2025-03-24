import axios from "../axios.config";

export const getRefundRequests = () => {
  return axios.get("owner/refund-requests");
};
