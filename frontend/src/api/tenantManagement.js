import axios from './axios.config';
export const getTenantsByBoardingHouse = (boardingHouseId) => {
  return axios.get(`owner/tenant/${boardingHouseId}`);
};
export const deleteTenantsByBoardingHouse = (boardingHouseId) => {
  return axios.delete(`owner/tenant/${boardingHouseId}`);
};
