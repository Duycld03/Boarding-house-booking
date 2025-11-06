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

export const handleExtensionRequestAction = (
  requestId,
  action,
  reasonForCancel = ''
) => {
  const payload = { action };
  if (action === 'reject') {
    payload.reasonForCancel = reasonForCancel;
  }
  return axios.put(`staff/renewal/${requestId}`, payload);
};
