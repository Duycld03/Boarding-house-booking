import axios from "./axios.config";
export const getRenewalRequestByBhID = (boardingHouseId) => {
  return axios.get(`manager/renewal/boarding-house/${boardingHouseId}`);
};
export const acceptExtensionRequest = (requestId) => {
  return axios.put(`manager/renewal/${requestId}`);
};
export const rejectExtensionRequest = (requestId, reasonForCancel) => {
  return axios.put(`manager/rejectrenewal/${requestId}`, { reasonForCancel });
};
