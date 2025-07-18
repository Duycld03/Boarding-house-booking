import axios from "../axios.config";


export const getRefundRequests = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams
    ? `staff/refund-requests?${queryParams}`
    : "staff/refund-requests";
  return axios.get(url);
};
export const cancelRefundRequestsForOwner = (requestId, reasonForCancel) => {
  return axios.put(`staff/refund-request/${requestId}`, { reasonForCancel });
};

export const acceptRefundRequestForOwner = (refundRequestId, data) => {
  return axios.post(`staff/refund-request/${refundRequestId}`, data);
};
