import axios from './axios.config';
export const getRenewalRequestByBhID = (
  boardingHouseId,
  filterValue = {},
  paginationOptions = {}
) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get(`staff/renewal/boarding-house/${boardingHouseId}`, {
    params,
  });
};

export const acceptExtensionRequest = (requestId) => {
  return axios.put(`owner/renewal/${requestId}`);
};
export const rejectExtensionRequest = (requestId, reasonForCancel) => {
  return axios.put(`owner/rejectrenewal/${requestId}`, { reasonForCancel });
};
