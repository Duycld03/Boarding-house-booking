import axios from './axios.config';
export const getTenantsByBoardingHouse = (boardingHouseId) => {
  return axios.get(`owner/tenant/${boardingHouseId}`);
};
export const deleteTenantFromBoardingHouse = (boardingHouseId, accountId) => {
  return axios.delete(`owner/tenant/${boardingHouseId}/${accountId}`);
};
