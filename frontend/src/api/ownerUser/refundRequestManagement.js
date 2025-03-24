import axios from '../axios.config';

export const getRefundRequests = () => {
  return axios.get('owner/refund-requests');
};
export const cancelRefundRequestsForOwner = (requestId, reasonForCancel) => {
  return axios.put(`owner/refund-request/${requestId}`, { reasonForCancel });
};
