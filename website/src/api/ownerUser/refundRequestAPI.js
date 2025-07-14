import axios from "../axios.config";

export const getRefundRequests = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams
    ? `owner/refund-requests?${queryParams}`
    : "owner/refund-requests";
  return axios.get(url);
};
export const cancelRefundRequestsForOwner = (requestId, reasonForCancel) => {
  return axios.put(`owner/refund-request/${requestId}`, { reasonForCancel });
};

export const acceptRefundRequestForOwner = (refundRequestId, data) => {
  return axios.post(`owner/refund-request/${refundRequestId}`, data);
};
