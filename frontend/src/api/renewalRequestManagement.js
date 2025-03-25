import axios from './axios.config';
export const getRenewalRequestByBhID = (boardingHouseId) => {
  return axios.get(`owner/renewal/boarding-house/${boardingHouseId}`);
};
export const acceptExtensionRequest = (requestId) => {
  return axios.put(`owner/renewal/${requestId}`);
};
export const rejectExtensionRequest = (requestId, reasonForCancel) => {
  return axios.put(`owner/rejectrenewal/${requestId}`, { reasonForCancel });
};
