import axios from "../axios.config";

export const getRefundRequests = () => {
  return axios.get("manager/refund-requests");
};
export const cancelRefundRequestsForOwner = (requestId, reasonForCancel) => {
  return axios.put(`manager/refund-request/${requestId}`, { reasonForCancel });
};

export const acceptRefundRequestForOwner = (refundRequestId, data) => {
  return axios.post(`manager/refund-request/${refundRequestId}`, data);
};
